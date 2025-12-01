# CLI Reference

The Olympix CLI provides command-line access to all Olympix tools. This page documents all available commands and their options.

---

## Installation

See [Installation Guide](../Installation.md) for download and authentication instructions.

---

## Commands Overview

| Command | Description |
|---------|-------------|
| `analyze` | Scan contracts for vulnerabilities |
| `generate-unit-tests` | Generate unit tests |
| `generate-mutation-tests` | Run mutation testing |
| `login` | Authenticate with Olympix |
| `show-vulnerabilities` | List all vulnerability detectors |
| `version` | Display CLI version |

---

## analyze

Performs static analysis on your Solidity contracts. See [Static Analysis](../Tools/Static%20Analysis.md) for concepts.

### Usage

```bash
olympix analyze [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-w, --workspace-path <path>` | Root project directory | Current directory |
| `-p, --path <path>` | Directory to analyze (repeatable) | `contracts/` and `src/` if present |
| `-f, --output-format <format>` | Output format: `tree`, `json`, `sarif`, `email` | `tree` |
| `-o, --output-path <path>` | Output directory (for `json`/`sarif`) | Terminal output |
| `--no-<vulnerability-id>` | Ignore specific detector (repeatable) | None |

### Examples

```bash
# Basic scan with tree output
olympix analyze

# Scan specific directory
olympix analyze -p src/core

# Output as SARIF for GitHub integration
olympix analyze -f sarif -o ./reports

# Output as JSON
olympix analyze -f json -o ./reports

# Ignore specific vulnerabilities
olympix analyze --no-unbounded-pragma --no-default-visibility

# Multiple directories
olympix analyze -p src/ -p contracts/
```

---

## generate-unit-tests

Generates unit tests for your smart contracts. See [Unit Testing](../Tools/Unit%20Testing.md) for setup requirements.

### Usage

```bash
olympix generate-unit-tests [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-w, --workspace-path <path>` | Root project directory | Current directory |
| `-env, --include-dot-env` | Include `.env` file with request | Disabled |
| `--env-file <path>` | Custom env file path (requires `-env`) | `.env` |
| `-ext, --extension <ext>` | Additional file extensions (repeatable) | `.sol`, `.t.sol`, `foundry.toml` |
| `-ca, --confirm-all` | Skip interactive prompts | Disabled |

### Examples

```bash
# Interactive mode
olympix generate-unit-tests -w .

# Non-interactive with env variables
olympix generate-unit-tests -w . -ca -env

# Include additional file types
olympix generate-unit-tests -w . -ext .json -ext .txt

# Custom env file
olympix generate-unit-tests -w . -env --env-file .env.local
```

### Output

Results are emailed to your registered address, including:

- Generated test files
- Coverage statistics
- Credit consumption

---

## generate-mutation-tests

Runs mutation testing against your existing test suite. See [Mutation Testing](../Tools/Mutation%20Testing.md) for concepts.

### Usage

```bash
olympix generate-mutation-tests [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-w, --workspace-path <path>` | Root project directory | Current directory |
| `-p, --path <path>` | Solidity file to mutate (repeatable) | Required |
| `-t, --timeout <seconds>` | Timeout per mutant (10-500) | 300 |
| `-env, --include-dot-env` | Include `.env` file with request | Disabled |
| `--env-file <path>` | Custom env file path (requires `-env`) | `.env` |
| `-ext, --extension <ext>` | Additional file extensions (repeatable) | `.sol`, `.t.sol`, `foundry.toml` |

### Examples

```bash
# Single contract
olympix generate-mutation-tests -p src/Vault.sol

# Multiple contracts
olympix generate-mutation-tests -p src/Vault.sol -p src/Token.sol

# Custom timeout (for complex tests)
olympix generate-mutation-tests -p src/Vault.sol -t 500

# With environment variables for fork testing
olympix generate-mutation-tests -p src/Vault.sol -env
```

### Output

Results are emailed to your registered address, including:

- Mutation score (killed / total)
- List of surviving mutants
- Details for each mutation

---

## login

Authenticates with Olympix and retrieves your API token.

### Usage

```bash
olympix login -e <email>
```

### Options

| Option | Description |
|--------|-------------|
| `-e, --email <email>` | Your registered email address |

### Process

1. Run the login command with your email
2. Check your email for a one-time code
3. Enter the code when prompted
4. Your API token is displayed and saved to `~/.opix/config.json`

!!! tip "Save Your Token"
    The displayed API token is required for GitHub Actions integration. Copy it to a secure location.

---

## show-vulnerabilities

Lists all vulnerability detectors supported by the analyzer.

### Usage

```bash
olympix show-vulnerabilities
```

This displays the detector slug (used with `--no-<slug>`) and description for each vulnerability type.

---

## version

Displays the installed CLI version.

### Usage

```bash
olympix version
```

---

## Common Options

These options apply to multiple commands:

### Workspace Path (`-w, --workspace-path`)

Specifies the root project directory. This provides context for the analyzer to resolve imports and dependencies.

```bash
olympix analyze -w /path/to/project
```

### Path (`-p, --path`)

Specifies which directories or files to process. Can be used multiple times.

```bash
olympix analyze -p src/ -p contracts/lib/
```

### Environment Variables (`-env, --include-dot-env`)

Includes your `.env` file with the request. Required for fork testing that needs RPC URLs or API keys.

!!! warning "Security"
    Environment variable data is encrypted with RSA before transmission. Only use this flag when necessary for fork testing.

### Extension (`-ext, --extension`)

Includes additional file types beyond the defaults (`.sol`, `.t.sol`, `foundry.toml`).

```bash
olympix generate-unit-tests -ext .json -ext .txt
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (authentication, network, etc.) |

---

## Configuration File

The CLI stores authentication data in `~/.opix/config.json`. See [Config Options](../ConfigOptions.md) for project-level configuration.
