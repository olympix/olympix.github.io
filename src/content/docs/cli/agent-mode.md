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

# Static analysis in agent mode
olympix static-analysis --agent

# List all sessions (agent mode only)
olympix sessions --agent
```

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

## BugPocer Agent Protocol

BugPocer's multi-stage pipeline maps to the following event/action sequence.

:::note[Diff mode]
Add `--diff-base <git ref>` (optionally `--diff-target <git ref>`) to constrain the scan to changed code — see [Diff mode](/cli/bugpocer/#diff-mode). The protocol below is unchanged, with one exception: an **empty diff** ends the run before `scope_review`, emitting a terminal `completed` event (`"No changed source files found…"`) instead of starting a session.
:::

### 1. Session Selection

**Event:** `sessions_list`

```json
{
  "event": "sessions_list",
  "data": {
    "sessions": [
      { "id": "abc-123", "title": "My Scan", "status": "ValidationRequested", "created_at": "...", "error_message": null }
    ]
  },
  "actions": ["new_session", "connect_session", "disconnect"]
}
```

**Actions:**

- `new_session` with optional `{ "title": "My scan" }` — start a new scan
- `connect_session` with `{ "session_id": "abc-123" }` — reconnect to an existing session

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
        "effective_verdict": "true_positive",
        "confidence_score": 90,
        "poc_summary": "...",
        "poc_content": "..."
      }
    ]
  },
  "actions": ["ask_question", "generate_pdf", "save_pocs", "save_findings_md", "disconnect"]
}
```

When findings arrive, the CLI **auto-downloads** the PoC exploit files and the split findings markdown to `.opix/agent/<session-id>/` (default filter: true positives + unverified). The actions let you re-export or query:

- `save_pocs` — re-export PoCs → `pocs_saved` `{ "session_id", "saved_count", "output_path" }`
- `save_findings_md` — re-export markdown → `findings_saved` `{ "session_id", "files": [{ "category", "count", "path" }] }`
- `generate_pdf` — generate the PDF report → `pdf_generated` `{ "session_id", "pdf_path" }`
- `ask_question` with `{ "question": "Explain the reentrancy" }` — ask a follow-up

### 7. Q&A

After `ask_question`, the CLI emits `qa_waiting` while the model responds, then:

**Event:** `question_answered`

```json
{
  "event": "question_answered",
  "data": { "session_id": "abc-123", "answer": "The reentrancy exists because..." }
}
```

---

## Test Generator Agent Protocol

`unit-testing`, `mutation-testing`, and the `generate-*` commands share the session / file-selection flow.

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

## File Output

In agent mode, the CLI writes structured results to `.opix/agent/` within the workspace:

```
.opix/agent/
├── <session-id>/          # BugPocer, per session
│   ├── scope.json         # Scope review data
│   ├── report.json        # Initial scan report
│   ├── findings.json      # Findings (mirrors findings_ready)
│   └── qa.json            # Q&A exchange history
├── unit-tests/
│   ├── sessions.json      # Session list
│   ├── contracts.json     # Available contracts
│   └── results.json       # Test results
└── mutation-tests/
    ├── sessions.json      # Session list
    └── results.json       # Test results
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

**Event:** `all_sessions` — sessions grouped per service (BugPocer, unit tests, mutation tests).

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

The CLI emits `scope_review`, then a `validation_item` for each inference, then (optionally) `security_question`s and the `additional_docs_prompt`, and finally `initial_scan_completed` / `findings_ready`. Respond to each with one of its advertised `actions`.

:::caution[One line per JSON object]
The protocol is newline-delimited JSON (NDJSON). Each command must be a single line — do not pretty-print commands sent to stdin.
:::

---

## Need Help?

If you encounter any issues or have questions, reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)
