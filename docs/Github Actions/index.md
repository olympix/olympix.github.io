# GitHub Actions

Olympix provides GitHub Actions for integrating security analysis and test generation into your CI/CD workflows. This page covers setup and configuration for all available actions.

---

## Available Actions

| Action | Purpose | Marketplace |
|--------|---------|-------------|
| `olympix/integrated-security` | Static analysis with SARIF output | [View](https://github.com/marketplace/actions/olympix-integrated-security) |
| `olympix/test-generator` | Unit test generation | [View](https://github.com/marketplace/actions/olympix-unit-test-generator) |
| `olympix/mutation-test-generator` | Mutation testing | [View](https://github.com/marketplace/actions/olympix-mutation-test-generator) |

---

## Prerequisites

### API Token

All actions require an Olympix API token:

1. Run `olympix login -e your_email@domain.com` locally
2. Copy the displayed API token
3. Add it as a repository secret named `OLYMPIX_API_TOKEN`

```yaml
env:
  OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
```

---

## Static Analysis

The `olympix/integrated-security` action scans your Solidity code for vulnerabilities. See [Static Analysis](../Tools/Static%20Analysis.md) for concepts.

### Basic Usage

```yaml title=".github/workflows/security.yml"
name: Security Scan
on: push

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Olympix Security Scan
        uses: olympix/integrated-security@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: olympix.sarif
```

### With Custom Options

```yaml
- name: Run Olympix Security Scan
  uses: olympix/integrated-security@main
  env:
    OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
  with:
    args: -f json -p src/ --no-unbounded-pragma
```

### Options

Pass CLI options via the `args` input:

| Option | Description |
|--------|-------------|
| `-p, --path <path>` | Directory to analyze |
| `-f, --output-format <format>` | `tree`, `json`, `sarif` (default), `email` |
| `-o, --output-path <path>` | Output directory |
| `--no-<vulnerability-id>` | Ignore specific detector |

### Output Files

| Format | Filename |
|--------|----------|
| SARIF | `olympix.sarif` |
| JSON | `olympix.json` |

---

## Unit Test Generation

The `olympix/test-generator` action generates unit tests for your contracts. See [Unit Testing](../Tools/Unit%20Testing.md) for setup requirements.

### Basic Usage

```yaml title=".github/workflows/unit-tests.yml"
name: Generate Tests
on:
  push:
    branches: [main]

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Install dependencies
        run: forge install

      - name: Generate Unit Tests
        uses: olympix/test-generator@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
```

### Auto-Commit Generated Tests

To automatically commit generated tests to your repository:

1. Create a GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
2. Add it as a secret named `OLYMPIX_GITHUB_TOKEN`
3. Create a branch named `opix-unit-test`

```yaml
- name: Generate Unit Tests
  uses: olympix/test-generator@main
  env:
    OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
    OLYMPIX_GITHUB_ACCESS_TOKEN: ${{ secrets.OLYMPIX_GITHUB_TOKEN }}
```

### Trigger on PR Merge

```yaml
name: Generate Tests on Merge
on:
  pull_request:
    types: [closed]

jobs:
  generate-tests:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... rest of workflow
```

### Output

Results are emailed to the address associated with your API token.

---

## Mutation Test Generation

The `olympix/mutation-test-generator` action runs mutation testing against your test suite. See [Mutation Testing](../Tools/Mutation%20Testing.md) for concepts.

### Basic Usage

```yaml title=".github/workflows/mutation-tests.yml"
name: Mutation Testing
on: push

jobs:
  mutation-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Install dependencies
        run: forge install

      - name: Run Mutation Tests
        uses: olympix/mutation-test-generator@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
        with:
          args: -p src/Vault.sol -p src/Token.sol
```

### Options

| Option | Description |
|--------|-------------|
| `-p, --path <path>` | Solidity file to mutate (required, repeatable, max 5) |
| `-t, --timeout <seconds>` | Timeout per mutant (10-500, default 300) |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OLYMPIX_API_TOKEN` | Required. Your API token |
| `OLYMPIX_FAIL_MUTATION_GHA_THRESHOLD` | Optional. Fail if mutation score below this percentage |
| `OLYMPIX_GITHUB_COMMIT_HEAD_SHA` | Optional. Commit SHA for check run annotation |

### GitHub Check Runs

To receive mutation test results as GitHub Check Runs:

1. Install the [Olympix Notifier GitHub App](https://github.com/apps/olympix-notifier)
2. Grant it permission to create check runs
3. Add the commit SHA to your workflow:

```yaml
- name: Run Mutation Tests
  uses: olympix/mutation-test-generator@main
  env:
    OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
    OLYMPIX_GITHUB_COMMIT_HEAD_SHA: ${{ github.sha }}
    OLYMPIX_FAIL_MUTATION_GHA_THRESHOLD: 30
  with:
    args: -p src/Vault.sol
```

### Trigger on Commit Message

```yaml
jobs:
  mutation-tests:
    if: contains(github.event.head_commit.message, 'OPIX-GEN-MUTATION-TESTS')
    # ...
```

### Output

Results are emailed to your registered address and optionally reported via GitHub Check Runs.

---

## Complete Workflow Example

This workflow runs security scanning on every push and generates tests on the main branch:

```yaml title=".github/workflows/olympix-ci.yml"
name: Olympix CI
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Security Scan
        uses: olympix/integrated-security@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: olympix.sarif

  generate-tests:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: foundry-rs/foundry-toolchain@v1

      - run: forge install

      - name: Generate Tests
        uses: olympix/test-generator@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
```

---

## Troubleshooting

**"Invalid API token"**
:   Verify your `OLYMPIX_API_TOKEN` secret is set correctly.

**"No contracts found"**
:   Ensure your contracts are in `contracts/` or `src/`, or specify the path with `-p`.

**Workflow timeout**
:   For mutation testing, set an appropriate `-t` timeout value.

---

## Support

For support, contact [contact@olympix.ai](mailto:contact@olympix.ai).
