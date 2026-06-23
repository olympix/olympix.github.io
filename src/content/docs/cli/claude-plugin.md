---
title: Claude Code Plugin
description: Install the Olympix Claude Code plugin — ready-made skills that run every Olympix tool through agent mode automatically.
---

Rather than implement the [agent mode](/cli/agent-mode/) JSON protocol yourself, install the **[Olympix Claude plugin](https://github.com/olympix/olympix-claude-plugin)** — a set of Claude Code skills that drive every Olympix tool through agent mode automatically.

---

## Prerequisites

- **Olympix CLI** — verify with `olympix version`. [Install the CLI](/installation/) if needed.
- **Foundry/Forge** — verify with `forge --version`. Install from [getfoundry.sh](https://getfoundry.sh).
- **Claude Code** — the AI coding assistant the plugin extends.

---

## Install

Inside Claude Code, run:

```
/plugin marketplace add olympix/olympix-claude-plugin
/plugin install olympix@olympix
```

Then restart Claude Code. No clone or setup script needed.

---

## Available skills

| Skill | Description |
|-------|-------------|
| `olympix:full-run` | Run all Olympix tools on a Foundry or Hardhat repo |
| `olympix:static-analysis` | Run the vulnerability scanner |
| `olympix:mutation-test` | Generate mutation tests for the top 10 contracts |
| `olympix:unit-test` | Generate unit tests with coverage scaffolding |
| `olympix:bug-pocer` | Run BugPocer security analysis (fully automated) |
| `olympix:assemble-report` | Collect results into `olympix-results/report.md` |
| `olympix:auth` | Check/refresh CLI authentication |

---

## Usage

Open Claude Code inside a Foundry or Hardhat project and run:

```
/olympix:full-run
```

This chains static analysis → unit tests → mutation tests → BugPocer → report. See the [plugin repository](https://github.com/olympix/olympix-claude-plugin) for full details.

---

## Need Help?

If you encounter any issues or have questions, reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)
