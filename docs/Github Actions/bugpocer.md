# BugPocer

The Olympix BugPocer action runs Olympix's AI-powered agentic security analysis on Solidity smart
contracts directly inside your pull-request workflow. BugPocer reasons about your code the way a
human auditor would — building a project context, ranking the highest-impact functions, and
generating proof-of-concept exploits for any vulnerabilities it finds — and posts its results back
to the PR for review.

You can access this action from the [GitHub Marketplace](https://github.com/marketplace/actions/olympix-bugpocer)
or visit the [GitHub repository](https://github.com/olympix/bugpocer-action).

---

## Overview

BugPocer is the agentic counterpart to the static [Integrated Security](./integrated-security.md)
action. Where Integrated Security runs detector-based scans, BugPocer launches an autonomous
auditor that:

- Reads the PR diff and surrounding context
- Selects the most impactful contracts and functions to analyze
- Verifies and severity-scores each vulnerability it finds
- Generates a Foundry proof-of-concept and posts review comments back to the PR

The action supports two trigger modes:

- **Manual mode** (recommended): scans only fire when a reviewer posts `/bugpocer scan` (or
  includes the same trigger in a commit message). This keeps your CI minutes focused on the PRs
  you actually want analyzed.
- **Every-commit mode**: scans every push to a PR.

---

## Features

- **PR-native UX:** Findings are posted as review comments on the exact lines that introduced the
  vulnerability, with PoC code attached.
- **Slash-command control:** Reviewers can start, cancel, or get help on a scan from the PR
  comment box — no need to re-trigger CI manually.

---

## Getting Started

1. **Set up your repository secret:**
      - Add a GitHub repository secret named `OLYMPIX_API_TOKEN` with your Olympix API token.

2. **Grant the workflow permissions to comment on PRs:**
      - The job needs `pull-requests: write` and `issues: write` so the action can post review
        comments and slash-command replies.

3. **Add the action to your workflow** (see examples below).

4. **(Manual mode only) Trigger a scan:**
      - Post `/bugpocer scan` as a PR comment, or include `/bugpocer scan` in a commit message
        and push the commit.

---

## Slash Commands

When `OLYMPIX_GITHUB_TRIGGER_MODE` is set to `manual`, the following commands can be posted as
PR comments — or, for `scan`, included anywhere in a commit message body — to control BugPocer:

| Command | Effect |
|---|---|
| `/bugpocer scan` | Start a BugPocer scan on this PR. One scan may run at a time per PR. |
| `/bugpocer cancel` | Stop the scan currently running on this PR. |
| `/bugpocer help` | Post a help message listing the available commands. |

The parser is case-insensitive on both the prefix and subcommand. Commands inside fenced
` ``` ` code blocks or quoted (`>`) reply lines are ignored, so you can mention them in
documentation without accidentally firing them.

---

## Usage Examples

### Example 1: Manual mode (recommended)

This workflow runs BugPocer only when a reviewer posts `/bugpocer scan` on a PR comment, or when
a commit pushed to the PR contains `/bugpocer scan` in its message.

!!! warning "Workflow file must live on the default branch"
    GitHub only fires `issue_comment` events for workflow files that exist on the
    repository's **default branch** (usually `main`). If you place this workflow on a
    feature branch and open a PR from that branch, slash commands posted as PR
    comments will be silently ignored — only `pull_request` events from pushes will
    trigger the workflow. Merge the workflow file to the default branch before relying on
    `/bugpocer scan|cancel|help` from PR comments. See
    [GitHub's documentation](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#issue_comment)
    for details.

```yaml
name: BugPocer Security Analysis (manual)
on:
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  bugpocer-analysis:
    if: |
      github.event_name == 'pull_request' ||
      (github.event.issue.pull_request != null &&
       startsWith(github.event.comment.body, '/bugpocer'))
    runs-on: ubuntu-latest
    steps:
      - name: Resolve PR head SHA and number
        id: pr
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            echo "sha=${{ github.event.pull_request.head.sha }}" >> "$GITHUB_OUTPUT"
            echo "number=${{ github.event.pull_request.number }}" >> "$GITHUB_OUTPUT"
          else
            PR_NUMBER=${{ github.event.issue.number }}
            SHA=$(gh api repos/${{ github.repository }}/pulls/$PR_NUMBER --jq .head.sha)
            echo "sha=$SHA" >> "$GITHUB_OUTPUT"
            echo "number=$PR_NUMBER" >> "$GITHUB_OUTPUT"
          fi

      - uses: actions/checkout@v3
        with:
          ref: ${{ steps.pr.outputs.sha }}
          submodules: recursive

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Run forge install
        run: forge install

      - name: Capture commit message (pull_request only)
        if: github.event_name == 'pull_request'
        run: |
          MSG=$(git log -1 --pretty=%B "${{ steps.pr.outputs.sha }}")
          {
            echo "OLYMPIX_TRIGGER_COMMIT_MESSAGE<<EOF"
            echo "$MSG"
            echo "EOF"
          } >> "$GITHUB_ENV"

      - name: BugPocer Security Analysis
        uses: olympix/bugpocer-action@create_action
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
          OLYMPIX_GITHUB_COMMIT_HEAD_SHA: ${{ steps.pr.outputs.sha }}
          OLYMPIX_GITHUB_PR_MODE: "true"
          OLYMPIX_GITHUB_TRIGGER_MODE: "manual"
          GITHUB_PR_NUMBER: ${{ steps.pr.outputs.number }}
          GITHUB_REPOSITORY_ID: ${{ github.repository_id }}
        with:
          args: -w . -ca
```

### Example 2: Every-commit mode

This workflow runs BugPocer automatically on every commit pushed to a PR, with no slash-command
gate. Use this if you want the previous behavior where every push triggered a fresh scan.

```yaml
name: BugPocer Security Analysis (every commit)
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  bugpocer-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          submodules: recursive

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Run forge install
        run: forge install

      - name: BugPocer Security Analysis
        uses: olympix/bugpocer-action@create_action
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
          OLYMPIX_GITHUB_COMMIT_HEAD_SHA: ${{ github.event.pull_request.head.sha }}
          OLYMPIX_GITHUB_PR_MODE: "true"
          OLYMPIX_GITHUB_TRIGGER_MODE: "every-commit"
          GITHUB_PR_NUMBER: ${{ github.event.pull_request.number }}
          GITHUB_REPOSITORY_ID: ${{ github.repository_id }}
        with:
          args: -w . -ca
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OLYMPIX_API_TOKEN` | Yes | Your Olympix API token. Store as a repository secret. |
| `OLYMPIX_GITHUB_PR_MODE` | Yes | Set to `"true"` to enable PR mode. |
| `OLYMPIX_GITHUB_TRIGGER_MODE` | Yes | `"manual"` (slash-command gate) or `"every-commit"`. |
| `OLYMPIX_GITHUB_COMMIT_HEAD_SHA` | Yes | The PR head commit SHA the scan should analyze. |
| `GITHUB_PR_NUMBER` | Yes | The PR number being scanned. Resolved differently for `pull_request` vs `issue_comment` events — see Example 1. |
| `GITHUB_REPOSITORY_ID` | Yes | The numeric repository ID (`${{ github.repository_id }}`). |
| `OLYMPIX_TRIGGER_COMMIT_MESSAGE` | Manual-mode `pull_request` events only | Captured from `git log -1 --pretty=%B`. Lets the trigger parser read the commit body for `/bugpocer scan`. |

---

## Action Inputs

The action accepts a single `args` input that is forwarded to the Olympix CLI. The most common
flags are:

- **`-w | --workspace-path`** — Project root directory. *Default:* current directory.
- **`-ca | --context-aware`** — Use the BugPocer agent (required when running in PR mode).

---

## Workflow Permissions

The job's `permissions` block must include:

- **`contents: read`** — to check out the repository.
- **`pull-requests: write`** — to post BugPocer's review comments on the PR diff.
- **`issues: write`** — to post slash-command replies (`/bugpocer scan` acknowledgments,
  `/bugpocer help` output, cancel confirmations).

---

## Troubleshooting

**Nothing happens after I post `/bugpocer scan` (or `cancel` / `help`).**
First check the Actions tab — does posting the comment trigger a workflow run at all?

- **No run at all:** the workflow file isn't on the repository's default branch. GitHub only
  fires `issue_comment` events for workflows that exist on the default branch (usually `main`).
  Push events from a feature branch will still trigger the workflow on that branch, but PR
  comments won't. Merge the workflow file to the default branch and retest on a fresh PR.
- **Run starts but exits with "No '/bugpocer' trigger found":** the parser couldn't find the
  command in the comment / commit body. The trigger parser is case-insensitive on the prefix and
  subcommand, but the command must be on its own (unquoted, non-code-block) line.
- **Run starts but exits with a `OLYMPIX_GITHUB_TRIGGER_MODE` error:** set
  `OLYMPIX_GITHUB_TRIGGER_MODE` to `"manual"` (or `"every-commit"`) in the workflow's `env:`
  block.

**A scan started on every push, even without a `/bugpocer scan` trigger.**
You're probably in `every-commit` mode. Set `OLYMPIX_GITHUB_TRIGGER_MODE` to `"manual"`.

**`/bugpocer cancel` returned "no scan is currently running" even though one was in progress.**
The session may have completed between your cancel and the lookup, or the active session was
started under a different API token. Refresh the PR — if there's no "BugPocer scan started"
comment from the bot, no scan is active.

**The action says "A BugPocer scan is already running for PR #N".**
Per-PR concurrency: only one scan runs at a time. Wait for the current scan to finish, or post
`/bugpocer cancel` to stop it.

---

## Support Contact

If you have any questions, need feedback, or require further assistance, feel free to reach out
at [contact@olympix.ai](mailto:contact@olympix.ai).
