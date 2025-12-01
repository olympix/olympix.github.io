# Static Analysis

Static analysis scans your Solidity code for security vulnerabilities and code quality issues without executing it. Olympix's analyzer checks for 80+ vulnerability patterns derived from real-world smart contract exploits.

---

## How It Works

The Olympix static analyzer parses your Solidity source code and applies a set of security detectors to identify potential vulnerabilities. Each detector targets a specific vulnerability pattern and reports:

- **Location**: File path and line number
- **Severity**: Critical, High, Medium, Low, or Info
- **Confidence**: How certain the analyzer is about the finding
- **Description**: What the vulnerability is and why it matters
- **Recommended Fix**: How to remediate the issue

---

## Vulnerability Categories

Olympix detects vulnerabilities across several categories:

| Category | Description |
|----------|-------------|
| **Access Control** | Unauthorized access, privilege escalation, arbitrary calls |
| **Reentrancy** | State manipulation from external calls |
| **Input Validation** | Missing or improper validation of inputs |
| **Arithmetic** | Integer overflow, underflow, precision loss |
| **Low-Level Calls** | Unchecked return values, unsafe call patterns |
| **Oracle Manipulation** | Price oracle and data feed vulnerabilities |
| **Signature Issues** | Replay attacks, malleability, missing validation |
| **Code Quality** | Best practices, visibility, shadowing, unused code |

For the complete list of 80+ detectors with detailed descriptions, see the [Detector Documentation](https://detectors.olympixdevsectools.com/) or run:

```bash
olympix show-vulnerabilities
```

---

## Severity Levels

| Severity | Description |
|----------|-------------|
| **Critical** | Immediate exploitation risk, funds at risk |
| **High** | Serious vulnerability that should be fixed before deployment |
| **Medium** | Moderate risk, should be addressed |
| **Low** | Minor issue or best practice violation |
| **Info** | Informational finding, no immediate risk |

---

## Output Formats

The analyzer supports multiple output formats for different use cases:

### Tree (Default)
Human-readable hierarchical display in the terminal. Best for interactive development.

```
├── src/contracts/Vault.sol
│   ├── LN:45 CL:5 SV:High CD:Medium ─ The contract is vulnerable to reentrancy attacks.
│   ├── LN:72 CL:9 SV:Medium CD:Medium ─ Calling a function without checking the return value may lead to silent failures.
│   │
```

Output key: **LN** (line), **CL** (column), **SV** (severity), **CD** (confidence)

### JSON
Structured data format for programmatic processing and integration with other tools.

### SARIF
Static Analysis Results Interchange Format. Used for:

- GitHub Code Scanning integration
- IDE integrations
- Security dashboard tools

### Email
Sends a formatted report to your registered email address.

---

## Configuration

You can customize the analyzer behavior using a configuration file. See [Config Options](../ConfigOptions.md) for details on:

- Ignoring specific vulnerabilities by file and line
- Marking paths as trusted (e.g., audited libraries)
- Marking contracts as trusted for specific detectors

---

## Using Static Analysis

=== "CLI"
    See [CLI Reference](../CLI/index.md#analyze) for command-line options.

    ```bash
    olympix analyze -p src/
    ```

=== "GitHub Actions"
    See [GitHub Actions](../Github%20Actions/index.md#static-analysis) for CI/CD integration.

    ```yaml
    - uses: olympix/integrated-security@main
      env:
        OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
    ```

=== "VSCode"
    See [VSCode Extension](../VSCode%20Extension/index.md) for real-time scanning in your editor.
