# Quickstart

Get your first vulnerability scan running in under 5 minutes.

---

## Prerequisites

- A Solidity project (Foundry or Hardhat)
- An Olympix account (email [contact@olympix.ai](mailto:contact@olympix.ai) for access)

---

## 1. Download the CLI

=== "macOS (Apple Silicon)"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.10.12/osx-arm64/olympix
    chmod +x olympix
    ```

=== "macOS (Intel)"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.10.12/osx-x64/olympix
    chmod +x olympix
    ```

=== "Linux (x64)"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.10.12/linux-x64/olympix
    chmod +x olympix
    ```

=== "Linux (ARM64)"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.10.12/linux-arm64/olympix
    chmod +x olympix
    ```

=== "Windows (x64)"
    ```powershell
    Invoke-WebRequest -Uri "https://olympix-download.s3.amazonaws.com/cli/v0.10.12/win-x64/olympix.exe" -OutFile "olympix.exe"
    ```

=== "Windows (ARM64)"
    ```powershell
    Invoke-WebRequest -Uri "https://olympix-download.s3.amazonaws.com/cli/v0.10.12/win-arm64/olympix.exe" -OutFile "olympix.exe"
    ```

---

## 2. Authenticate

```bash
./olympix login -e your_email@domain.com
```

A one-time code will be sent to your email. Enter it when prompted.

---

## 3. Run Your First Scan

Navigate to your Solidity project and run:

```bash
./olympix analyze
```

The CLI automatically detects your contracts in `contracts/` or `src/` directories.

---

## Example Output

```
Starting connection
Connection established
Checking authorization
Scanning files
Finding bugs

├── src/contracts/core/StrategyManager.sol
│   ├── LN:133 CL:5 SV:High CD:Medium ─ The contract is vulnerable to signature replay attacks, potentially allowing malicious actors to reuse valid signatures.
│   ├── LN:170 CL:9 SV:Medium CD:Medium ─ Calling a function without checking the return value may lead to silent failures.
│   ├── LN:313 CL:18 SV:Low CD:Medium ─ External calls in a loop may lead to denial of service if those calls revert.
│   │
├── src/contracts/strategies/StrategyBase.sol
│   ├── LN:172 CL:32 SV:Medium CD:Medium ─ Performing integer division before multiplication can lead to unnecessary loss of precision.
│   ├── LN:60 CL:5 SV:Medium CD:Medium ─ Using uninitialized state variables may lead to unexpected behavior.
│   ├── LN:307 CL:34 SV:Low CD:Medium ─ Using an input parameter to a function as a divisor without checking the parameter may result in a division-by-zero error.
│   │
```

Output key:

- **LN** - Line number
- **CL** - Column number
- **SV** - Severity (Critical, High, Medium, Low, Info)
- **CD** - Confidence (Critical, High, Medium, Low)

---

## Next Steps

| Goal | Documentation |
|------|---------------|
| Understand vulnerability detectors | [Static Analysis](./Tools/Static%20Analysis.md) |
| See all CLI options | [CLI Reference](./CLI/index.md) |
| Generate unit tests | [Unit Testing](./Tools/Unit%20Testing.md) |
| Integrate with CI/CD | [GitHub Actions](./Github%20Actions/index.md) |
| Ignore false positives | [Config Options](./ConfigOptions.md) |
| Get real-time feedback in IDE | [VSCode Extension](./VSCode%20Extension/index.md) |

---

## Common Commands

```bash
# Scan specific directory
./olympix analyze -p src/core

# Output as JSON
./olympix analyze -f json -o ./reports

# Output as SARIF (for GitHub)
./olympix analyze -f sarif -o ./reports

# List all detectors
./olympix show-vulnerabilities

# Check CLI version
./olympix version
```

---

## Troubleshooting

**"Permission denied" on macOS/Linux**
:   Run `chmod +x olympix` to make the binary executable.

**"Unidentified developer" warning on macOS**
:   Go to System Preferences > Security & Privacy > General, then click "Open Anyway".

**No vulnerabilities found**
:   Verify your contracts are in `contracts/` or `src/`, or specify the path with `-p`.

---

For support, contact [contact@olympix.ai](mailto:contact@olympix.ai).
