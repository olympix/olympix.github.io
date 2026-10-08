---
title: Agent Mode
description: Drive the Olympix CLI programmatically with a structured JSON protocol over stdin/stdout for AI coding assistants and automation.
---

Agent mode lets AI coding assistants and automation tools drive the Olympix CLI programmatically through a structured JSON protocol over stdin/stdout.

---

## Overview

When `--agent` (or `-am`) is passed to any command, the CLI:

- Emits structured JSON events to **stdout**, one JSON object per line (NDJSON)
- Reads JSON commands from **stdin**, one per line
- Writes structured results to `.opix/agent/` in the workspace directory
- Suppresses interactive prompts and TUI rendering
- Routes all human-readable log output to **stderr**, keeping stdout a clean JSON stream

This makes it possible for tools like Claude Code, Cursor, GitHub Copilot, or custom scripts to run Olympix analyses, respond to prompts, and consume results without human interaction.

:::tip[Claude Code plugin]
If you use **Claude Code**, you don't have to drive this protocol by hand. The [Olympix Claude plugin](https://github.com/olympix/olympix-claude-plugin) ships ready-made skills that run every Olympix tool through agent mode for you. Install it from inside Claude Code:

```
/plugin marketplace add olympix/olympix-claude-plugin
/plugin install olympix@olympix
```

Then restart Claude Code and run `/olympix:full-run` in any Foundry or Hardhat project. See the [Claude Code Plugin](/cli/claude-plugin/) page for prerequisites and the full skill list.
:::

---

## Enabling Agent Mode

Add `--agent` (or `-am`) to any command:

```bash
# BugPocer in agent mode
olympix bug-pocer --agent

# Unit testing in agent mode
olympix unit-testing --agent

# Mutation testing in agent mode
olympix mutation-testing --agent

# Fuzz testing in agent mode
olympix generate-fuzz-tests -p src/Vault.sol --agent
olympix connect-fuzz-session -s <session-id> --agent

# Static analysis in agent mode
olympix static-analysis --agent

# List all sessions (agent mode only)
olympix sessions --agent
```

`tui`, `theme`, `login`, `login-sso` and the `org-*` commands have no agent protocol — they ignore `--agent` and stay interactive.

Alternatively, set the environment variable:

```bash
export OLYMPIX_AGENT_MODE=1
olympix bug-pocer
```

---

## JSON Protocol

### Events (CLI → Agent)

Every line the CLI writes to stdout is a JSON object with this shape:

```json
{
  "event": "<event_type>",
  "data": { },
  "actions": ["action1", "action2"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type identifier |
| `data` | object, string, or null | Event-specific payload |
| `actions` | string[] or null | Valid actions the agent may send next |

### Commands (Agent → CLI)

Send one JSON object per line to stdin:

```json
{
  "action": "<action_name>",
  "data": { }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | The action to perform (must be one of the advertised `actions`) |
| `data` | object or null | Action-specific payload |

`disconnect` is always a valid action at any prompt — it gracefully closes the connection and exits.

### Common Events

| Event | Description | Data |
|-------|-------------|------|
| `progress` | Status update | `{ "message": "...", "percent": 42 }` |
| `error` | Error occurred | `{ "message": "...", "expected_actions": [...] }` |
| `completed` | Operation finished with nothing further to do | A message string (e.g. no eligible files / all contracts mercy-ruled) |

---

## Static Analysis Agent Protocol

Both `analyze` and `static-analysis` run a **fresh scan** in agent mode. `static-analysis` skips its interactive session picker rather than reconnecting to a previous run, so the two commands behave identically here.

```bash
olympix analyze -w . --agent
olympix static-analysis -w . --agent
```

**Event:** `findings_ready` — reuses the BugPocer findings shape: the three `*_verdict` fields and `category` are `"n/a"`, `confidence_score` and `hidden_not_exploitable` are `0`, and `session_id` and the PoC and group fields are omitted:

```json
{
  "event": "findings_ready",
  "data": {
    "findings": [
      {
        "id": "f1",
        "title": "unchecked-return-value",
        "severity": "High",
        "description": "...",
        "affected_code": "...",
        "file_path": "src/Vault.sol",
        "line_number": 42,
        "bugpocer_verdict": "n/a",
        "user_verdict": "n/a",
        "effective_verdict": "n/a",
        "confidence_score": 0,
        "category": "n/a"
      }
    ],
    "hidden_not_exploitable": 0
  }
}
```

The CLI exits 0 straight after emitting the findings — no action is required. Findings you have ignored in `opix.config.json` are filtered out before the event is emitted. A workspace with no Solidity files emits an `error` event and exits non-zero.

---

## BugPocer Agent Protocol

BugPocer's multi-stage pipeline maps to the following event/action sequence.

`bug-pocer` starts at session selection. `start-bp-session` skips `sessions_list`/`new_session` and begins directly at step 2 (`scope_review`, or `diff_review` in diff mode); the rest of the flow is identical and it accepts the same `--diff-base`/`--diff-target` flags.

:::note[Diff mode]
Add `--diff-base <git ref>` (optionally `--diff-target <git ref>`) to constrain the scan to changed code — see [Diff mode](/cli/bugpocer/#diff-mode). Two differences from the flow below: the scope step arrives as an immutable **`diff_review`** event (the whole diff is the scope) with actions `["confirm_diff", "disconnect"]` instead of `scope_review`; and an **empty diff** ends the run before scope, emitting a terminal `completed` event (`"No changed source files found…"`) instead of starting a session.
:::

:::note[Directed mode]
Add `--directed` with `--domains <id,...>` and/or `--directions-file <path>` to run a [directed scan](/cli/bugpocer/#directed-mode), or pass the same options on `new_session` (see below). A directed run adds a [`directed_scope`](#12-directed-scope-directed-mode-only) confirmation step before `context_cache_review` and `scope_review`. In agent mode the scope must contain at least one domain or direction; `--domains` / `--directions-file` without `--directed` fail at startup.
:::

### 1. Session Selection

**Event:** `sessions_list`

```json
{
  "event": "sessions_list",
  "data": {
    "sessions": [
      { "id": "abc-123", "title": "My Scan", "status": "ValidationRequested", "created_at": "...", "scan_mode": "full", "directed": false, "phase": "awaiting_validation" }
    ]
  },
  "actions": ["new_session", "connect_session", "disconnect"]
}
```

`phase` says what the stored `status` means for you:

| `status` | `phase` |
|----------|---------|
| `Pending`, `ChatStarted` | `in_progress` |
| `ValidationRequested` | `awaiting_validation` |
| `ValidationCompleted` | `scanning` |
| `InitialScanCompleted` | `completed` |
| `Killed`, `ContextExpired` | `terminal` |

**Actions:**

- `new_session` with optional `{ "title": "My scan" }` — start a new scan
  - For a directed scan, add `"directed": true` with `"domains": ["vaults", "oracles"]` and/or `"directions": ["Can a stale price enable borrowing?"]` (or `"directions_file": "targets.md"`). Supplying `domains`, `directions` or `directions_file` implies `directed: true`; `"directed": false` starts a standard scan even after a directed one.
- `connect_session` with `{ "session_id": "abc-123" }` — reconnect to an existing session

A relative `directions_file` (and `--directions-file`) path is opened by the CLI process, so it resolves from the directory the CLI was launched in, not from `-w`. Pass an absolute path when launching from elsewhere.

### 1.1 Pre-flight Failures (informational)

**Event:** `preflight_failed` — emitted after `new_session`, before `scope_review`, when the [pre-flight check](/cli/bugpocer/#pre-flight-validation) finds issues that will likely break the scan:

```json
{
  "event": "preflight_failed",
  "data": {
    "failures": [{ "check": "...", "summary": "..." }],
    "remediation_commands": ["forge install", "..."],
    "message": "..."
  }
}
```

It carries no `actions`: agent mode never waits on pre-flight, so the run has already continued. Report the failures and `remediation_commands` to the user. `--skip-preflight` (`-sp`) turns the check off.

### 1.2 Directed Scope (directed mode only)

**Event:** `directed_scope` — emitted first when the session is directed, before `context_cache_review` and `scope_review`.

```json
{
  "event": "directed_scope",
  "data": {
    "domains": ["vaults", "oracles"],
    "directions": ["Can a stale oracle price let a user borrow more than their collateral allows?"]
  },
  "actions": ["confirm_directed", "disconnect"]
}
```

**Actions:**

- `confirm_directed` — accept the directed scope and continue
- `disconnect` — end the run without starting a scan

Like other prompts, a stdin read [timeout](#timeouts) re-emits `directed_scope`. Any other action returns an `error` with code `invalid_directed_action` and the prompt stays open. An invalid scope (unknown domain, no targets, a domain on a non-Solidity project, or directions over the limits) returns an `error` with code `invalid_directed_scope`; a server without directed support returns `directed_unavailable`.

Findings from a directed scan carry `directed_target_ids` (the domains or directions each finding was attributed to) and `directed_scope_reason`.

### 1.5 Context Cache Review (conditional)

**Event:** `context_cache_review` — emitted only when a prior context matches this codebase and `--rebuild-context` was not passed.

```json
{
  "event": "context_cache_review",
  "data": {
    "match_type": "exact",
    "source_session_id": "def-456",
    "cached_at": "2026-07-01T12:00:00Z",
    "overlap_percent": 100,
    "changed_files": [],
    "changed_files_total": 0,
    "summary": {}
  },
  "actions": ["reuse_context", "rebuild_context", "disconnect"]
}
```

**Actions:**

- `reuse_context` — reuse the cached context (exact match) or seed context building from it (partial match)
- `rebuild_context` — ignore the cache and build a fresh context

`match_type` is `exact` (identical source fingerprint) or `partial` (`overlap_percent` ≥ 80). Closing stdin without answering defaults an exact match to reuse. See [Context Cache](/cli/bugpocer/#context-cache) for the rules.

### 2. Scope Review

**Event:** `scope_review`

```json
{
  "event": "scope_review",
  "data": {
    "contracts": [
      { "name": "Vault", "file": "src/Vault.sol", "functions": [{ "name": "withdraw", "visibility": "public" }] }
    ],
    "libraries": []
  },
  "actions": ["select_scope", "confirm_all", "disconnect"]
}
```

**Actions:**

- `confirm_all` — scan the full inferred scope
- `select_scope` with `{ "exclude_contracts": [...], "exclude_libraries": [...], "exclude_functions": [...], "additional_docs": { "notes": "...", "links": [...] } }` — narrow the scope

### 3. Validation Items

**Event:** `validation_item` — sent one at a time

```json
{
  "event": "validation_item",
  "data": {
    "key": "identity",
    "name": "Project Identity",
    "confidence": 85,
    "content": "DeFi lending protocol...",
    "options": [
      { "id": "opt1", "label": "Alternative 1", "value": "..." }
    ],
    "current": 1,
    "total": 7
  },
  "actions": ["confirm_item", "reject_item", "select_option", "disconnect"]
}
```

**Actions:**

- `confirm_item` — accept the inference
- `reject_item` with `{ "explanation": "custom correction" }` — provide a correction
- `select_option` with `{ "option_id": "opt1" }` — pick a suggested alternative

### 4. Security Questions

**Event:** `security_question`

```json
{
  "event": "security_question",
  "data": {
    "question_id": "q1",
    "category": "trust_boundaries",
    "is_required": true,
    "priority": 1,
    "question_text": "Who are the trusted operators?",
    "context": null,
    "suggested_answers": [
      { "id": "a1", "label": "Only owner", "value": "...", "show_follow_up_ids": [] }
    ],
    "current": 1,
    "total": 5,
    "is_follow_up": false,
    "parent_question_id": null
  },
  "actions": ["select_answer", "custom_answer", "skip_question", "disconnect"]
}
```

**Actions:**

- `select_answer` with `{ "question_id": "q1", "answer_id": "a1" }` — pick a suggested answer
- `custom_answer` with `{ "question_id": "q1", "answer": "free text" }` — provide your own answer
- `skip_question` — skip an optional question

### 5. Additional Documentation Prompt

**Event:** `additional_docs_prompt`

```json
{
  "event": "additional_docs_prompt",
  "data": { "message": "Attach additional documentation..." },
  "actions": ["submit_docs", "skip_docs", "disconnect"]
}
```

**Actions:**

- `submit_docs` with `{ "notes": "...", "links": [...] }` — submit docs and start the scan
- `skip_docs` — start the scan without additional docs

:::caution
This is the one prompt that spends credits. An EOF (closed stdin) or any unrecognized action here **aborts without submitting** — only an explicit `submit_docs` or `skip_docs` starts the billable scan.
:::

### 6. Results

**Event:** `initial_scan_completed`

```json
{
  "event": "initial_scan_completed",
  "data": { "session_id": "abc-123", "message": "Scan complete", "total_scan_cost": "150 credits" }
}
```

**Event:** `findings_ready`

```json
{
  "event": "findings_ready",
  "data": {
    "session_id": "abc-123",
    "findings": [
      {
        "id": "f1",
        "title": "Reentrancy in withdraw()",
        "severity": "High",
        "description": "...",
        "affected_code": "...",
        "file_path": "src/Vault.sol",
        "line_number": 42,
        "bugpocer_verdict": "true_positive",
        "user_verdict": "unreviewed",
        "effective_verdict": "true_positive",
        "category": "tp",
        "confidence_score": 90,
        "poc_summary": "...",
        "poc_content": "...",
        "group_id": "group_f1",
        "group_role": "Primary",
        "group_title": "Missing access control on vault withdrawals",
        "group_root_cause": "...",
        "group_fix": "..."
      }
    ],
    "hidden_not_exploitable": 3
  },
  "actions": ["set_verdict", "fetch_findings", "generate_pdf", "save_pocs", "save_findings_md", "disconnect"]
}
```

Fields with no value (for example `user_verdict_reason` on an unreviewed finding) are omitted rather than sent as `null`. Fields worth knowing:

- `category` is BugPoCer's [assessment](/cli/bugpocer/#bugpocer-assessment-and-your-verdict) with your verdict applied: `tp` (Verified), `unverified` (Needs Further Review) or `fp` (Not Exploitable). Use it for the final call. `bugpocer_verdict` and `effective_verdict` are true/false only (`user_verdict` adds `unreviewed`) and can't express Needs Further Review: an unproven finding shows there as `true_positive` or `false_positive`, depending on BugPoCer's raw call.
- `affected_code` is the affected source snippet (the evidence), not the PoC; the PoC is in `poc_content`.
- `title` is the display title the PDF and markdown exports print (for example `Uncollected Taker Fees`), and `file_path` is relative to the project root.
- `group_*` fields are set when the finding is part of a [finding group](/cli/bugpocer/#finding-groups): every member shares one `group_id`, the lead has `group_role` `Primary` and the rest `Member`, and `group_title`, `group_root_cause` and `group_fix` describe the shared defect. They are omitted for ungrouped findings.
- `hidden_not_exploitable` counts the Not Exploitable findings left out of `findings`: the ones nobody has reviewed yet, unless `showNotExploitableFindings` is on in `~/.opix/config.json`. Send `fetch_findings` with `{ "include_false_positives": true }` to get them too; when the count is above 0, a `progress` line names that action.

If you connect before the scan has finished, `findings_ready` carries `"scan_complete": false`, the session's `session_status` and its `phase`. Its `findings` list is empty and isn't a result: nothing is downloaded, the export actions return an `error`, and a `progress` line says the scan is still running (or that the session ended without findings). Disconnect and reconnect once `sessions_list` shows the session `completed`, or send `fetch_findings` to ask the server again. A finished scan carries `"scan_complete": true`.

When findings arrive, the CLI **auto-downloads** the PoC files (under `pocs_<session-id>/`) and the findings markdown (`findings_<session-id>_<timestamp>.md`) to the working directory, using the default filter: Verified and Needs Further Review, all severities, nothing a reviewer rejected. `findings.json` in `.opix/agent/<session-id>/` mirrors the `findings_ready` event. The actions let you re-export or query:

- `save_pocs` — re-export PoCs → `pocs_saved` `{ "session_id", "saved_count", "output_path", "filter" }`
- `save_findings_md` — re-export markdown → `findings_saved` `{ "session_id", "files": [{ "category", "count", "path" }], "filter" }`, where `category` is `Findings` or `Ruled Out`
- `generate_pdf` — generate the PDF report → `pdf_generated` `{ "session_id", "pdf_path", "filter" }`
- `fetch_findings` — re-send `findings_ready`, optionally with `{ "include_false_positives": true }`; while `scan_complete` is `false` it asks the server again
- `set_verdict` with `{ "verdicts": [{ "finding_id": "f1", "verdict": true, "reason": "confirmed" }] }` — record verdicts in bulk (`true` = accept, `false` = reject, `null` = clear to unreviewed) → `verdict_set` with one `results` entry per finding

The three export actions take an optional `filter` in `data`, mirroring the interactive [export dialog](/cli/bugpocer/#exporting-results). Omitted keys keep their defaults:

| Key | Default |
|-----|---------|
| `include_true_positives` (Verified) | `true` |
| `include_unverified` (Needs Further Review) | `true` |
| `include_false_positives` (Not Exploitable) | `false` |
| `include_high` / `include_medium` / `include_low` | `true` |
| `include_reviewer_accepted` (accepted or not yet reviewed) | `true` |
| `include_reviewer_rejected` | `false` |

```json
{"action":"generate_pdf","data":{"filter":{"include_false_positives":true,"include_low":false}}}
```

Leaving every assessment, every severity, or both reviewer keys off is rejected with an `error`.

### Killing a Session

`kill-bp-session` terminates an active session. It is a one-shot command — the session ID is passed as a flag and no stdin input is needed:

```bash
olympix kill-bp-session -s <session-id> --agent
```

**Event:** `session_killed`

```json
{
  "event": "session_killed",
  "data": { "session_id": "abc-123", "was_running": true }
}
```

`was_running` is `false` when the session was not running (e.g. already completed). A missing session ID or no acknowledgment within 30 seconds emits an `error` event and exits non-zero.

---

## Test Generator Agent Protocol

`unit-testing`, `mutation-testing`, `generate-unit-tests` and `generate-mutation-tests` share the session / file-selection flow. Fuzz generation follows a different, dispatch-only flow — see [Fuzz Test Generator Agent Protocol](#fuzz-test-generator-agent-protocol).

### Session & file selection

`sessions_list` (actions `new_session`, `connect_session`, `disconnect`) works as above. Starting a new session emits:

**Event:** `file_selection`

```json
{
  "event": "file_selection",
  "data": {
    "command": "generate-unit-tests",
    "files": ["src/Token.sol", "src/Vault.sol"],
    "max_files": 10
  },
  "actions": ["select_files"]
}
```

Respond with `select_files` and `{ "selected": ["src/Token.sol"] }`.

### Dispatch receipt

Generation runs asynchronously and results are delivered by email; the CLI confirms dispatch with:

**Event:** `results_ready`

```json
{
  "event": "results_ready",
  "data": { "type": "unit_test", "session_id": "abc-123", "message": "unit test generation started. Check email for results." },
  "actions": ["disconnect"]
}
```

If a run has **nothing to generate** (e.g. the selected contracts have no matching OlympixUnitTest test file, or all subject contracts were mercy-ruled), the CLI emits a terminal `completed` event with an explanatory message instead — a valid, non-error outcome.

### Fetching results

Reconnecting to a finished session (`connect_session`) fetches and downloads results:

**Event:** `unit_test_results`

```json
{
  "event": "unit_test_results",
  "data": {
    "session_id": "abc-123",
    "total_files": 4,
    "successful_files": 3,
    "branches_coverage": 72.5,
    "test_files": [
      { "subject_contract": "Vault", "subject_path": "src/Vault.sol", "test_contract": "VaultTest", "test_path": "test/Vault.t.sol", "has_new_tests": true, "coverage_before": 40.0, "coverage_after": 72.5, "passed": 12, "failed": 0 }
    ]
  }
}
```

**Event:** `mutation_test_results`

```json
{
  "event": "mutation_test_results",
  "data": {
    "session_id": "abc-123",
    "total_mutations": 50,
    "killed": 42,
    "survived": 8,
    "score_percentage": 84,
    "mutations": [
      { "file": "src/Vault.sol", "line": 42, "original": "...", "mutated": "...", "killed": true, "broken_tests": [] }
    ]
  }
}
```

The generated `.t.sol` test files are written into the workspace automatically.

### Listing contracts

`generate-unit-tests --list --agent` emits `list_contracts` `{ "contracts": [{ "index", "name", "path" }] }` and exits.

---

## Fuzz Test Generator Agent Protocol

Fuzz runs are **long-lived**. `generate-fuzz-tests` only dispatches the run and returns a session ID — full results are emailed and can be pulled back later with `connect-fuzz-session`.

```bash
# Dispatch a run (returns a session_id; results arrive by email)
olympix generate-fuzz-tests -w . -p src/Vault.sol --agent

# List your fuzz sessions
olympix list-fuzz-sessions --agent

# Fetch a finished session's summary (+ optional PDF report)
olympix connect-fuzz-session -s <session-id> --agent

# Session manager: list, then reconnect, in one process
olympix fuzz-testing -w . --agent
```

### Dispatching a run

`generate-fuzz-tests` emits a `progress` event carrying the new session ID, then a terminal `completed` event:

```json
{
  "event": "completed",
  "data": { "type": "fuzz_test", "session_id": "abc-123", "message": "Fuzz generation started; results pending." }
}
```

### Fetching results

`connect-fuzz-session` (and `connect_session` from a session list) emits a summary of the finished run:

**Event:** `fuzz_test_results`

```json
{
  "event": "fuzz_test_results",
  "data": {
    "session_id": "abc-123",
    "contracts": 3,
    "strategies": 7,
    "test_cases": 128,
    "exploit_test_cases": 2
  },
  "actions": ["generate_report", "disconnect"]
}
```

- `generate_report` — render the PDF report → `pdf_generated` `{ "session_id", "pdf_path" }`
- `disconnect` — exit without generating a report

If the run has not finished yet, the CLI emits `results_ready` `{ "type": "fuzz_test", "session_id", "message": "Results not ready yet…" }` instead and exits.

### Session manager

`list-fuzz-sessions` and `fuzz-testing` both emit `sessions_list` (actions `new_session`, `connect_session`, `disconnect`) and then follow the fetch flow above once you send `connect_session`.

:::note[Starting a run]
These two commands accept `connect_session` only. `new_session` returns an `error` event — dispatch a new run with `generate-fuzz-tests -p <file> --agent` instead.
:::

---

## File Output

In agent mode, the CLI writes structured results to `.opix/agent/` within the workspace:

```
.opix/agent/
├── <session-id>/          # BugPocer, per session ("pending/" until the ID is known)
│   ├── scope.json         # Scope review data
│   ├── diff.json          # Diff review data (diff mode)
│   ├── context-cache.json # Context cache review data
│   ├── report.json        # Initial scan report
│   └── findings.json      # Findings (mirrors findings_ready)
├── bug-pocer/
│   └── sessions.json      # Session list
├── unit-tests/
│   ├── sessions.json      # Session list
│   ├── contracts.json     # Available contracts
│   └── results.json       # Test results
├── mutation-tests/
│   ├── sessions.json      # Session list
│   └── results.json       # Test results
└── fuzz-tests/
    ├── sessions.json      # Session list
    └── results.json       # Fuzz run summary
```

Files are written atomically (temp file + rename) and use snake_case JSON.

:::tip[Git integration]
Add `.opix/` to your `.gitignore` — these are local working files, not meant to be committed.
:::

---

## Sessions Command

The `sessions` command is agent-mode-only and returns active sessions across all services in a single response:

```bash
olympix sessions --agent
```

**Event:** `all_sessions` — sessions grouped per service, as the arrays `bug_pocer`, `unit_tests`, `mutation_tests`, `fuzz_tests` and `static_analysis`. Each entry has `id`, `title`, `status` and `created_at`; `bug_pocer` entries add `scan_mode`, `directed` and [`phase`](#1-session-selection).

---

## Error Handling

Errors are emitted as `error` events:

```json
{
  "event": "error",
  "data": {
    "message": "Invalid data payload: ...",
    "expected_actions": ["select_scope", "confirm_all", "disconnect"]
  }
}
```

The `expected_actions` field tells you what the CLI is still waiting for. Re-send a valid action to continue — a malformed or invalid action is reported and re-prompted rather than terminating the session.

### Timeouts

While stdin stays open, the CLI does **not** give up on a slow agent: on an internal read timeout it re-emits the pending event and keeps waiting. It only ends a stage when it receives a valid action or when **stdin is closed (EOF)**, at which point it disconnects and exits.

### Disconnecting

Send `{ "action": "disconnect" }` at any prompt to gracefully close the connection and exit. This is always a valid action.

---

## Example: Full BugPocer Session

```bash
# Newline-delimited commands piped to stdin
olympix bug-pocer --agent <<'EOF'
{"action":"new_session"}
{"action":"confirm_all"}
{"action":"confirm_item"}
{"action":"confirm_item"}
{"action":"submit_docs","data":{"notes":"","links":[]}}
EOF
```

The CLI emits `context_cache_review` (if a prior context matches), then `scope_review` (or `diff_review` in diff mode), then a `validation_item` for each inference, then (optionally) `security_question`s and the `additional_docs_prompt`, and finally `initial_scan_completed` / `findings_ready`. Respond to each with one of its advertised `actions`.

:::caution[One line per JSON object]
The protocol is newline-delimited JSON (NDJSON). Each command must be a single line — do not pretty-print commands sent to stdin.
:::

---

## Need Help?

If you encounter any issues or have questions, reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)
