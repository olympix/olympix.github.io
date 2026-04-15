# BugPoCer

BugPoCer is an AI-powered internal audit tool that automates end-to-end vulnerability exploitation for smart contracts — moving beyond static warnings to deliver **concrete, verifiable Proof-of-Concept (PoC) exploits**.

---

## Overview

Built on Olympix's proprietary Intermediate Representation (IR) and symbolic execution engine, BugPoCer combines results from multiple analysis engines to identify **confirmed** security issues. For each vulnerability, it automatically generates a **ready-to-run Foundry-format PoC test** that reproduces the exploit under realistic attack conditions.

### Key Capabilities

- **Automated Vulnerability Detection** — AI-driven protocol scanning
- **Project Context and Invariant Building** — Approve inferred project context
- **PoC Generation** — Automatically creates Foundry test files that demonstrate exploits
- **Interactive Analysis** — Ask follow-up questions about findings

---

## Prerequisites

!!! info "Project Requirements"
    - A Foundry project that builds and where `forge test` succeeds
    - An Olympix account — log in with `olympix login -e <email>` (or `olympix login-sso -e <email>` if your organization uses SSO) before starting a scan (see [Installation](../Installation.md))

---

## Pipeline Overview

BugPoCer runs as a multi-stage pipeline. The analysis itself happens server-side, so most stages are asynchronous — you can close the CLI between stages and reconnect whenever an email tells you it's your turn again.

<style>
.pipeline-wrap table { table-layout: fixed; width: 100%; }
.pipeline-wrap th:nth-child(1), .pipeline-wrap td:nth-child(1) { width: 4%; }
.pipeline-wrap th:nth-child(2), .pipeline-wrap td:nth-child(2) { width: 13%; }
.pipeline-wrap th:nth-child(3), .pipeline-wrap td:nth-child(3) { width: 43%; }
.pipeline-wrap th:nth-child(4), .pipeline-wrap td:nth-child(4) { width: 17%; }
.pipeline-wrap th:nth-child(5), .pipeline-wrap td:nth-child(5) { width: 23%; }
</style>

<div class="pipeline-wrap" markdown="1">

| # | Stage | What happens | Session state | Email sent |
|---|-------|--------------|---------------|------------|
| 1 | **Start session** | You run `olympix bug-pocer`, pick a project, name the session, select scope, and optionally attach additional documentation. Nothing is committed server-side until you press `Enter` to submit the documentation step — at that point the session is created, transitions to `ChatStarted`, and the *Scan Started* email fires. Cancelling during scope selection or the documentation step leaves no session behind. | — → `ChatStarted` | *BugPoCer Scan Started* |
| 2 | **Context building** | Server scans your uploaded code (including any documentation found in the repo) and infers project identity, intent, core functions, design goals, patterns, invariants, and security assumptions. | `ChatStarted` | — |
| 3 | **Context validation** | You review and correct the inferences the engine isn't confident about. | `ValidationRequested` | *[Action Required] Validate Project Context* (or the *…(Partial)* variant if some context agents fell short). You have 72 hours to respond; if you don't, reminder emails fire inside the window and the session is killed when it expires. |
| 4 | **Initial scan** | Validated context is fed into the vulnerability scan and PoC generation. | `ValidationCompleted` | — |
| 5 | **Findings review** | Reconnect, browse findings, mark verdicts, export reports. | `InitialScanCompleted` | *BugPoCer Initial Scan Complete* |

</div>

After the initial scan you can also ask follow-up questions, which cycles the session between `QuestionReceived` and `QuestionAnswered`.

---

## Quick Start

1. **Log in** (once): `olympix login -e <email>` — or `olympix login-sso -e <email>` for SSO orgs.
2. **Start a scan** from your project root: `olympix bug-pocer` → *Start new session* → name it → pick scope → (optionally) attach documentation → press `Enter` to submit. Your session is created at submission.
3. **Wait for the validation email** (subject: *[Action Required] Validate Project Context*).
4. **Validate**: run `olympix bug-pocer` again, reopen the session, confirm or correct each inference, then submit.
5. **Wait for the scan-complete email** (subject: *BugPoCer Initial Scan Complete*).
6. **Review** findings, record your verdicts, and export results (Markdown / PDF / PoC `.sol` files).

---

## CLI Command

From your project root:

!!! tip "Quick Start"
    ```bash
    olympix bug-pocer
    ```

**Available options:**

| Option | Description |
|--------|-------------|
| `-w, --workspace-path` | Root project directory path (default: current directory) |
| `-env, --include-dot-env` | Include `.env` file for fork testing secrets (RPC URLs, API keys, etc.) |
| `--env-file` | Path to a custom `.env` file (requires `-env`) |
| `-ext, --extension` | Additional file extensions to include (can be used multiple times) |

!!! tip "Including env variables"
    If your Foundry tests need `RPC URLs`, `API keys`, `private keys`, etc., pass them with `-env` (reads from `.env`) or `--env-file <path>` for a custom file. Format: see `https://book.getfoundry.sh/cheatcodes/env-string`.

    This is the recommended way to pass env variables — the file is encrypted in transit with an extra RSA layer on top of the regular channel encryption.

---

## Session Picker

Running `olympix bug-pocer` on a project with existing sessions shows the session picker:

- **Start a new session** — begin a fresh scan.
- **Return to an active session** — continue an in-progress scan.
- **Reconnect to a past session** — review results from a completed scan.

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate sessions |
| `Enter` | Open the selected session |
| `n` | New session |
| `r` | Refresh |
| `q` | Quit |

### Session status reference

| Status | Meaning |
|--------|---------|
| `ChatStarted` | Session created, context building in progress |
| `ValidationRequested` | Waiting for you to validate project context |
| `ValidationCompleted` | Context approved, initial scan running |
| `InitialScanCompleted` | Scan finished, findings available for review |
| `QuestionReceived` | Processing a follow-up question |
| `QuestionAnswered` | Response ready |

---

## Scope Selection

When you start a new session, the CLI displays an interactive scope picker so you can decide which files BugPoCer analyzes. The tree is pre-filtered by the default ignore list (see [Scope and ignore config](#scope-and-ignore-config)) and by any `BugPocerScopePaths` / `BugPocerIgnorePaths` in your `olympix-config.json`.

| Key | Action |
|-----|--------|
| `Enter` | Expand/collapse the selected item |
| `i` | Include item |
| `x` | Exclude item |
| `Space` | Toggle include/exclude |
| `/` | Search |
| `a` | Expand all |
| `z` | Collapse all |
| `h` | Hide/show excluded items |
| `e` | Exclude all |
| `u` | Include all |
| `b` | Browse more (add items not shown by default) |
| `s` | Save and continue |
| `Esc` | Cancel |

### Scope and ignore config

In addition to the interactive picker, you can pre-seed scope with a config file at the project root:

```json
{
    "BugPocerScopePaths": [
        "src/core/",
        "src/vaults/vault.sol"
    ],
    "BugPocerIgnorePaths": [
        "src/examples/",
        "src/mocks/mock.sol"
    ]
}
```

| Option | Description |
|--------|-------------|
| `BugPocerScopePaths` | **Positive scoping** — if defined, BugPoCer will ONLY consider files whose paths start with one of these entries. Leave empty or omit to consider all files. |
| `BugPocerIgnorePaths` | Paths to exclude. Any file whose path starts with one of these entries is ignored. |

!!! info "How scope and ignore interact"
    1. If `BugPocerScopePaths` is defined and non-empty, only files matching a scope path are considered.
    2. From the scoped files, any matching `BugPocerIgnorePaths` are excluded.
    3. If `BugPocerScopePaths` is empty or omitted, all files are in scope (minus ignores).
    4. The interactive scope picker starts from this config — you can further refine it there.

#### Default ignore list

BugPoCer automatically excludes common non-production paths. Files whose path contains any of the following are always ignored:

`node_modules`, `test`, `mock`, `example`, `dependencies`, `forge-std`, `openzeppelin`, `solmate`, `solady`, `prb-math`, `prb-test`, `murky`, `permit2`, `v3-core`, `v3-periphery`, `v2-core`, `v2-periphery`

!!! note "Difference from other Olympix tools"
    BugPoCer does **not** use the general `IgnoredPaths`, `TrustedPaths`, `TrustedVariables`, or `TrustedContracts` options. Use `BugPocerScopePaths` and `BugPocerIgnorePaths` instead.

---

## Adding Project Documentation

After you save scope, BugPoCer gives you a chance to attach **additional** documentation — material that lives outside the repository and wouldn't otherwise reach the engine.

!!! note "BugPoCer already reads in-repo docs automatically"
    During context building, the server ingests documentation it finds in your codebase on its own: `README.md` and `AGENTS.md` at the project root, every `*.md` file under `docs/`, and other `.md` files elsewhere in the tree (truncated for very long ones). You don't need to re-paste any of that here.

| Key | Action |
|-----|--------|
| `n` | Add free-text notes |
| `l` | Add a documentation link (URL) |
| `f` | Load a local file (any readable text file — common picks: `.md`, `.sol`, `.txt`) |

!!! tip "What to add here"
    Think *private* or *external* context: internal design docs, threat models, audit scopes, Notion pages, architecture diagrams exported to text, protocol specs hosted elsewhere, trust assumptions that aren't written down in the repo. Anything that explains how the system is *supposed* to behave but doesn't live in a `.md` file in the codebase. This material is one of the biggest levers on result quality — the engine can read your code but it cannot read your whiteboard.

All attached documentation shares a combined budget of roughly 100,000 tokens; the UI shows how much headroom is left as you add items.

Press `Enter` to submit. This is the point at which your session is created server-side (`ChatStarted`) and the *BugPoCer Scan Started* email fires. If you quit before this step, no session is created.

---

## Context Validation

Once the server has built its understanding of your project, you'll receive the *[Action Required] Validate Project Context* email. Reconnect with `olympix bug-pocer`, open the session, and walk through the items the engine wants you to confirm.

### What gets validated

BugPoCer infers seven categories of context:

- **Identity** — what the project is (name, type)
- **Intent / Description** — what the project does
- **Core Functions** — each key piece of functionality (one item per function)
- **Design Goals** — each intended design goal (one item per goal)
- **Patterns** — architectural and code patterns detected
- **Invariants** — properties that must always hold (one item per invariant)
- **Security Assumptions** — trust boundaries and assumptions about external entities

Inferences the engine is already confident about are auto-confirmed and don't appear in the validation queue. You only see the items the engine is unsure of.

### Per-item actions

Each validation item shows the engine's inference, a confidence score, and up to three suggested alternatives.

| Key | Action |
|-----|--------|
| `y` | Confirm the inference is correct |
| `n` | Reject — then enter a custom replacement |
| `1` – `3` | Pick one of the suggested alternatives |
| `0` | Enter a custom answer from scratch |
| `e` | Expand / collapse the alternative options |
| `←` / `→` | Navigate between items |
| `d` | Download the context as Markdown |
| `Enter` | Submit all validations (enabled once every item has an answer) |

### Editing the project context directly

Alongside the per-item TUI, BugPoCer writes the full project context object to your workspace so you can read or edit the whole thing in one place:

| File | Purpose |
|------|---------|
| `.opix/project-context.json` | The complete context object — identity, intent, patterns, invariants, security assumptions, etc. Edit this file directly to mutate the context; your edits are picked up next time you open the session. |
| `.opix/.project-context-state.json` | Validation progress for the current request (which items you've confirmed, selected alternatives, custom values). |

Both files persist across CLI restarts. If you close the CLI mid-validation, the next time you open the session within the 72-hour window you'll see a *"Found existing validation progress (X of Y items validated). Resume?"* prompt and pick up exactly where you left off. If you've already answered every item, you'll drop straight into the final review phase before submission.

!!! info "Why validation matters"
    Your feedback tells the engine what's intentional vs. what might be a vulnerability. Accurate context means more real findings and fewer false positives. Treat validation as part of the scan, not paperwork after it.

Once you submit, the session transitions to `ValidationCompleted` and the initial scan begins. You can close the CLI — the *BugPoCer Initial Scan Complete* email will tell you when results are ready.

---

## Reviewing Findings

When the scan completes, reopen the session from the picker. You'll land on a menu:

| Option | Action |
|--------|--------|
| `[0]` | Display Initial Report |
| `[1]` | Display Findings (interactive pager) |
| `[2]` | Generate and Save PDF Report |
| `[3]` | Save Findings (Markdown) |
| `[4]` | Save PoCs (individual `.sol` files) |
| `[5]` | Back to Sessions |

### Verdict terminology

There are two distinct classifications attached to every finding: what the **engine** thinks, and what **you** think.

**Engine classification** — determined by the engine and whether it could machine-verify the exploit:

- **True Positive (TP)** — the engine confirmed the bug *and* its generated PoC compiled and reproduced the exploit.
- **Unverified** — the engine flagged the issue but the PoC did not compile (or the Foundry build failed). Exploitability isn't machine-verified, so these still warrant a human look.
- **False Positive** — the PoC compiled but did not reproduce the bug.

!!! warning "TP vs Non-TP in the CLI display"
    The interactive findings pager (`[1]`) collapses this into a binary badge: **`TP`** (green) for confirmed true positives, **`NON-TP`** (yellow) for everything else. Unverified findings are folded into `NON-TP` in the pager — you can tell them apart by reading the finding's PoC summary. The **exported reports** (PDF and Markdown) break out all three categories separately.

**User verdict** — your own verdict on each finding, displayed beside the engine badge in the pager as `VERDICT: TP` / `VERDICT: NON-TP` / `VERDICT: —` (unset). User verdicts are stored independently of the engine's classification.

!!! tip "Record your verdicts"
    Taking the time to mark each finding pays off twice. Your verdicts show up in every export (so the PDF/Markdown you hand off is already triaged), and they feed back into BugPoCer to improve your future scans on similar code.

### Interactive findings pager (`[1]`)

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate findings / page |
| `←` / `→` | Previous / next page |
| `Enter` | Expand / collapse a finding |
| `o` | View the generated PoC full-screen |
| `y` | Mark as true positive (prompts for an optional reason) |
| `n` | Mark as false positive (prompts for an optional reason) |
| `Space` | Cycle user verdict |
| `Backspace` | Clear user verdict |
| `t` | Toggle TP-only filter |
| `v` | Toggle filter source (engine verdict vs. user verdict) |
| `d` | Download currently displayed findings / context as Markdown |
| `b` | Back to menu |
| `q` | Quit the findings view |

---

## Exporting Results

Every export option (`[2]`, `[3]`, and `[4]`) walks you through a two-stage filter dialog first.

**Stage 1 — finding category** (Space toggles, Enter confirms):

- **True Positives** *(default: on)*
- **Unverified** *(default: on)*
- **False Positives** *(default: off)*

**Stage 2 — severity** (Space toggles, Enter confirms):

- **High** *(default: on)*
- **Medium** *(default: on)*
- **Low** *(default: on)*

At least one category and at least one severity must be selected.

### Markdown (`[3]`) — lightweight per-category report

`[3]` is a **stripped-down** export, not the full audit report. It's meant for sharing a filtered list of findings without the full methodology/scope/invariants/assumptions wrapper.

It writes **one file per selected category** (so you may get up to three files in a single export):

- `true_positives_<sessionId>_<timestamp>.md`
- `unverified_<sessionId>_<timestamp>.md`
- `false_positives_<sessionId>_<timestamp>.md`

Each file contains:

- A title and scan metadata (session ID, scan start/complete times, report generation time, repository, commit short SHA, branch)
- Total finding count and a Foundry-build-failure disclaimer if relevant
- Per-finding blocks ordered by severity, each with the severity badge, vulnerability name, unit name, location, description, your user verdict (if set) with optional reason, and the PoC summary

The **PoC code itself is not inlined** in the Markdown export — use `[4]` to get the PoCs as `.sol` files, or use the PDF export for a single document that includes everything. Files are written to your current working directory.

### PDF (`[2]`) — full audit-style report

`[2]` produces an audit-style PDF suitable for handing to stakeholders or clients. It's generated server-side from the same underlying scan data and includes everything the Markdown export leaves out.

The PDF contains:

- **Cover page** — Olympix branding, repository org (when available), and the scan's completed/partial status
- **Table of contents** — auto-generated
- **About** — methodology, disclaimer (with a Foundry-build-failure note if relevant), and project overview drawn from your validated context
- **Scope** — repository, commit short SHA, branch, scanned-unit count, and the list of units analyzed
- **Summary** — scan start/complete/generation times, a High/Medium/Low severity table for true positives, a pie chart of TP findings by severity, and severity-level definitions
- **True Positive Findings**, grouped by severity, each with vulnerability name, unit, location, description, your user verdict + reason (if set), PoC summary, and the **full PoC Solidity code** with syntax highlighting
- **Unverified Findings**, same structure, for engine-flagged issues whose PoC didn't compile
- **False Positive Findings**, same structure

Saved to your current working directory as `BugPoCer_<sessionId>_<timestamp>.pdf`.

### PoCs (`[4]`) — Solidity files

One `.sol` file per finding that has a compilable PoC, written under your workspace so you can drop them straight into your Foundry test suite.

---

## Interactive Q&A

There is no "Ask a question" menu option. To reach the Q&A prompt:

1. From the post-scan menu, choose `[1] Display Findings`.
2. Navigate the findings pager as usual, then exit the pager (press `q`).
3. The CLI prints:

    ```
    You can ask questions to BugPocer or enter nothing to exit:>
    ```

4. Type your question and press `Enter`. Press `Enter` on an empty line to finish.

Example questions:

- "Explain the reentrancy vulnerability in more detail"
- "How can I fix the access control issue in Vault.sol?"
- "Are there any other functions affected by this pattern?"

Questions cycle the session through `QuestionReceived` → `QuestionAnswered`.

---

## Scan Report Fields

Each finding in the BugPoCer scan report includes:

### Vulnerability Details

- **Description** — what the vulnerability is and how it can be exploited
- **Severity** — risk level (High, Medium, or Low)
- **Location** — affected file and line numbers

### Exploit Demonstration

- **PoC Test** — a ready-to-run Foundry test that reliably triggers the issue
- **Test Location** — path to the generated test file
- **Summary** — explanation of how the PoC demonstrates the vulnerability

!!! note "Processing Time"
    Scan duration depends on project size and complexity. Larger projects with more complex logic will take longer to analyze.

---

## Need Help?

If you encounter any issues or have questions, reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)
