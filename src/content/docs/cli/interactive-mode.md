---
title: Interactive Mode (TUI)
description: Launch any Olympix tool, monitor live sessions, and manage results from a single interactive terminal UI.
---

The Olympix CLI includes an interactive terminal UI that lets you launch any tool, monitor live sessions, and manage results — all from a single entry point.

---

## Launching the TUI

Run `olympix` with no arguments:

```bash
olympix
```

The TUI requires an interactive terminal (not piped output). If you need non-interactive automation, see [Agent Mode](/cli/agent-mode/).

---

## Tool Selection Menu

The main menu presents all available tools with keyboard navigation:

```
  O L Y M P I X
  Proactive Smart Contract Security
  ─────────────────────────────────

  Select a tool to launch:

  ❯ [1] BugPocer - Interactive AI-powered security analysis
    [2] Mutation Testing - Generate mutation tests to verify test suite effectiveness
    [3] Unit Testing - Generate unit tests for OlympixUnitTest contracts
    [4] Fuzz Testing - Generate fuzz tests for smart contract security
    [5] Static Analysis - Scan contracts for vulnerabilities and security issues
```

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate tools |
| `Enter` | Launch selected tool |
| `1`–`5` | Quick-select by number |
| `q` / `Esc` | Exit |

### Live sessions

If you have active or recently completed sessions, they appear below the tool list. Select a session to reconnect directly — no need to navigate through the tool's session picker first.

Sessions auto-refresh every 15 seconds while the menu is open.

---

## Interactive Tool Commands

Each tool also has its own dedicated command that launches directly into its interactive session manager. These are the same handlers the TUI dispatches internally:

| Command | Description |
|---------|-------------|
| `olympix static-analysis` | Interactive static analysis — file selection, scan, results |
| `olympix unit-testing` | Unit test session manager — list, reconnect, or start new |
| `olympix mutation-testing` | Mutation test session manager — list, reconnect, or start new |
| `olympix fuzz-testing` | Interactive fuzz test generator |
| `olympix bug-pocer` | BugPocer session manager — see [BugPoCer docs](/cli/bugpocer/) |

These commands accept the same workspace and path options as their `analyze` / `generate-*` counterparts:

```bash
# Launch static analysis on a specific workspace
olympix static-analysis -w /path/to/project

# Launch unit testing on a specific workspace
olympix unit-testing -w /path/to/project
```

:::tip[When to use which]
- **`olympix`** (TUI) — best for exploratory work; pick whatever tool you need from one place.
- **`olympix <tool>`** — best when you already know which tool you want.
- **`olympix analyze`** / **`olympix generate-unit-tests`** / etc. — the original non-interactive commands, still available for scripting and CI/CD.
:::

---

## Access Tiers

Some tools require specific account tiers:

| Tool | Requirement |
|------|-------------|
| Static Analysis | Free |
| Mutation Testing | Premium |
| Unit Testing | Premium |
| Fuzz Testing | Premium + Private Alpha |
| BugPocer | Premium + Private Alpha |

If you don't have access to a tool, the menu shows the requirement and prevents selection. Contact [contact@olympix.ai](mailto:contact@olympix.ai) to upgrade.

---

## Helpful Links

- **[Agent Mode](/cli/agent-mode/)** — non-interactive JSON protocol for AI agent integrations
- **[BugPoCer](/cli/bugpocer/)** — detailed BugPoCer documentation
- **[Analysis](/cli/analysis/)** — static analysis and reporting
- **[Unit Test Generation](/cli/unit-testing/)** — unit test generation guide
- **[Mutation Test Generation](/cli/mutation-testing/)** — mutation test generation guide
