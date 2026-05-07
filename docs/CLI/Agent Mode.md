# Agent Mode

Agent mode lets AI coding assistants and automation tools drive the Olympix CLI programmatically through a structured JSON protocol over stdin/stdout.

---

## Overview

When `--agent` (or `-am`) is passed to any command, the CLI:

- Emits structured JSON events to **stdout** (one JSON object per line)
- Reads JSON commands from **stdin**
- Writes structured results to `.opix/agent/` in the workspace directory
- Suppresses interactive prompts and TUI rendering

This makes it possible for tools like Claude Code, Cursor, GitHub Copilot, or custom scripts to run Olympix analyses, respond to prompts, and consume results without human interaction.

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
  "data": { ... },
  "actions": ["action1", "action2"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type identifier |
| `data` | object or null | Event-specific payload |
| `actions` | string[] or null | Valid actions the agent can send next |

### Commands (Agent → CLI)

Send one JSON object per line to stdin:

```json
{
  "action": "<action_name>",
  "data": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | The action to perform (must be one of the advertised `actions`) |
| `data` | object or null | Action-specific payload |

### Common Events

| Event | Description | Data |
|-------|-------------|------|
| `progress` | Status update | `{ "message": "...", "percent": 42 }` |
| `error` | Error occurred | `{ "message": "...", "expected_actions": [...] }` |
| `completed` | Operation finished | Varies by tool |

---

## BugPocer Agent Protocol

BugPocer's multi-stage pipeline maps to the following event/action sequence:

### 1. Session Selection

**Event:** `sessions_list`

```json
{
  "event": "sessions_list",
  "data": {
    "sessions": [
      { "id": "abc-123", "title": "My Scan", "status": "ValidationRequested", "created_at": "..." }
    ]
  },
  "actions": ["select_session", "new_session", "disconnect"]
}
```

### 2. Scope Review

**Event:** `scope_review`

```json
{
  "event": "scope_review",
  "data": {
    "contracts": [
      { "name": "Vault", "file": "src/Vault.sol", "functions": [...] }
    ],
    "libraries": [...]
  },
  "actions": ["select_scope", "confirm_all", "disconnect"]
}
```

### 3. File Selection (Static Analysis / Test Generators)

**Event:** `file_selection`

```json
{
  "event": "file_selection",
  "data": {
    "files": [{ "path": "src/Token.sol", "selected": true }, ...],
    "selected_count": 5,
    "total_count": 12
  },
  "actions": ["select_files", "confirm_all", "disconnect"]
}
```

### 4. Validation Items (BugPocer)

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
- `reject_item` with `{ "value": "custom text" }` — provide a correction
- `select_option` with `{ "option_id": "opt1" }` — pick a suggested alternative

### 5. Security Questions (BugPocer)

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
    "suggested_answers": [
      { "id": "a1", "label": "Only owner", "value": "..." }
    ],
    "current": 1,
    "total": 5
  },
  "actions": ["select_answer", "custom_answer", "skip_question", "disconnect"]
}
```

### 6. Additional Documentation Prompt (BugPocer)

**Event:** `additional_docs_prompt`

```json
{
  "event": "additional_docs_prompt",
  "data": { "message": "Attach additional documentation..." },
  "actions": ["submit_docs", "disconnect"]
}
```

### 7. Results

**Event:** `initial_scan_completed` (BugPocer)

```json
{
  "event": "initial_scan_completed",
  "data": {
    "session_id": "abc-123",
    "message": "Scan complete",
    "total_scan_cost": "150 credits"
  }
}
```

**Event:** `findings_ready` (BugPocer)

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
        "line_number": 42
      }
    ]
  }
}
```

**Event:** `results_ready` (Unit / Mutation / Fuzz Tests)

```json
{
  "event": "results_ready",
  "data": {
    "session_id": "abc-123",
    "message": "Results ready",
    "download_url": "..."
  }
}
```

### 8. Q&A (BugPocer)

**Event:** `question_answered`

```json
{
  "event": "question_answered",
  "data": {
    "session_id": "abc-123",
    "answer": "The reentrancy vulnerability exists because..."
  }
}
```

**Action:** `ask_question` with `{ "question": "Explain the reentrancy in more detail" }`

---

## File Output

In agent mode, the CLI writes structured results to `.opix/agent/` within the workspace:

```
.opix/agent/
├── <session-id>/
│   ├── scope.json          # Scope review data
│   ├── findings.json       # BugPocer findings
│   ├── report.json         # Initial scan report
│   └── qa.json             # Q&A exchange history
├── unit-tests/
│   ├── sessions.json       # Session list
│   ├── contracts.json      # Available contracts
│   └── results.json        # Test results
├── mutation-tests/
│   ├── sessions.json       # Session list
│   └── results.json        # Test results
└── fuzz-tests/
    └── results.json        # Test results
```

These files are written atomically (via temp file + rename) and use snake_case JSON.

!!! tip "Git integration"
    Add `.opix/` to your `.gitignore` — these are local working files, not meant to be committed.

---

## Sessions Command

The `sessions` command is agent-mode-only and returns all active sessions across all services in a single response:

```bash
olympix sessions --agent
```

**Event:** `all_sessions`

```json
{
  "event": "all_sessions",
  "data": {
    "bug_pocer": [
      { "id": "...", "title": "...", "status": "...", "created_at": "..." }
    ],
    "unit_tests": [...],
    "mutation_tests": [...]
  }
}
```

---

## Error Handling

Errors are emitted as `error` events:

```json
{
  "event": "error",
  "data": {
    "message": "Invalid JSON: ...",
    "expected_actions": ["select_scope", "confirm_all", "disconnect"]
  }
}
```

The `expected_actions` field tells you what the CLI is still waiting for. Re-send a valid action to continue.

### Timeouts

The CLI waits up to 300 seconds (5 minutes) for each stdin command by default. If no input arrives within the timeout, it emits an error and exits.

### Disconnecting

Send `{ "action": "disconnect" }` at any prompt to gracefully close the WebSocket connection and exit. This is always a valid action.

---

## Example: Full BugPocer Session

```bash
# Start
echo '{"action":"new_session"}' | olympix bug-pocer --agent

# The CLI emits scope_review, validation_items, etc.
# Respond to each with the appropriate action on stdin.

# Simplified script:
olympix bug-pocer --agent <<'EOF'
{"action":"select_session","data":{"session_id":"abc-123"}}
{"action":"confirm_all"}
{"action":"confirm_item"}
{"action":"confirm_item"}
{"action":"submit_docs","data":{"notes":"","links":[],"files":[]}}
EOF
```

!!! warning "One line per JSON object"
    The protocol is newline-delimited JSON (NDJSON). Each command must be a single line. Do not pretty-print commands sent to stdin.

---

## Need Help?

If you encounter any issues or have questions, reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)
