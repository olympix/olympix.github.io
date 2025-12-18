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
    - A successfully compiling Foundry project
    - Valid Olympix credentials (obtain via `olympix login`)

---

## CLI Commands

### Starting a BugPoCer Scan

To start a new scan or reconnect to past sessions, navigate to your project root and run:

!!! tip "Quick Start"
    ```bash
    olympix bug-pocer
    ```

The scan will analyze your smart contracts, identify vulnerabilities, generate PoC tests, and produce a comprehensive report.

**Available Options:**

| Option | Description |
|--------|-------------|
| `-w, --workspace-path` | Root project directory path (default: current directory) |
| `-env, --include-dot-env` | Include .env file for fork testing secrets (RPC URLs, API keys, etc.) |
| `--env-file` | Path to custom .env file (requires `-env` flag) |
| `-ext, --extension` | Additional file extensions to include (can be used multiple times) |

!!! tip "Including env variables"
    We provide the ability to pass environment variables with your Solidity files. If you would like to provide `RPC URLs`, `API keys`, `private keys`, etc., you can do so by using the `-env` flag which will read these parameters from your `.env` file. You can also specify a custom filepath for your `env` file using the `--env-file` flag.
    Refer here for format guidelines: `https://book.getfoundry.sh/cheatcodes/env-string`.

    Note: If you do require passing `env variables` for your `forge` run, this is the recommended way to do it. We encrypt all communication of this file with an extra layer of RSA on top of the regular encryption.

---

## Scan Workflow

When you run `olympix bug-pocer`, here's what to expect from start to finish:

### Step 1: Session Selection

The CLI displays a session picker where you can:
- **Start a new session** — Begin a fresh scan
- **Return to active session** — Continue an in-progress scan
- **Connect to a past session** — Review results from a completed scan

Use arrow keys to navigate, Enter to select, or press `n` for new, `r` to refresh, `q` to quit.

### Step 2: Session Naming (New Sessions Only)

When starting a new session, you'll be prompted to name it:
```
Name for this session (Enter for 'org/repo@abc1234'):
```

The default name is generated from your git repository info. Press Enter to accept or type a custom name.

### Step 3: File Upload

Your project files are scanned and uploaded to the Olympix servers. This includes:
- All Solidity files (`.sol`)
- Configuration files (`foundry.toml`, `remappings.txt`)
- Documentation files (README, etc.)
- Environment variables (if `-env` flag was used)

### Step 4: Project Context Validation

BugPoCer analyzes your codebase and infers project context. You'll be asked to review and validate:

- **Project Identity** — Name, type, and purpose of the protocol
- **Intent/Description** — What the protocol does
- **Core Functions** — Key functionality of the system
- **Design Goals** — Intended behavior and constraints
- **Patterns** — Detected architectural patterns
- **Invariants** — Properties that should always hold
- **Security Assumptions** — Trust boundaries and assumptions

For each item below the confidence threshold, you can:
- Press **Y** to confirm it's correct
- Press **N** to reject and provide an explanation

!!! info "Why Validation Matters"
    Your feedback helps BugPoCer understand what's intentional vs. what might be a vulnerability. Accurate context leads to better findings and fewer false positives.

### Step 5: Scan Execution

After you approve the project context, the scan begins. At this point:

- The CLI displays: *"Bug pocer started successfully, waiting for initial scan to complete..."*
- You'll receive your **Session ID** for reconnecting later
- **You will receive an email** when the scan completes

!!! tip "Long-Running Scans"
    You can safely close the CLI and reconnect later using `olympix bug-pocer`. Your session will appear in the session picker with its current status.

### Step 6: Results Review

When the scan completes, on session reconnection you'll be able to:

1. **View Findings** — Parse through findings and PoCs
2. **Update Findings** — Mark true positive/false positive verdicts and add comments
3. **Save Findings** — Option to save the report to a local file

### Step 7: Interactive Q&A

After viewing results, you can ask follow-up questions:
```
You can now ask questions to BugPocer or enter nothing to exit:>
```

Example questions:
- "Explain the reentrancy vulnerability in more detail"
- "How can I fix the access control issue in Vault.sol?"
- "Are there any other functions affected by this pattern?"

---

## Session Status Reference

When viewing the session picker, sessions display their current status:

| Status | Meaning |
|--------|---------|
| `CHATSTARTED` | Session created, awaiting context validation |
| `VALIDATIONREQUESTED` | Waiting for you to validate project context |
| `VALIDATIONCOMPLETED` | Context approved, scan in progress |
| `INITIALSCANCOMPLETED` | Scan finished, results available |
| `QUESTIONRECEIVED` | Processing a follow-up question |
| `QUESTIONANSWERED` | Response ready |

---

## Scope and Ignore Configuration

BugPoCer uses its own scope and ignore settings, separate from the general Olympix configuration options. These are configured in your `olympix-config.json` file at the project root.

### BugPoCer-Specific Options

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
| `BugPocerScopePaths` | **Positive scoping** — If defined, BugPoCer will ONLY analyze files whose paths start with one of these entries. Leave empty or omit to analyze all files. |
| `BugPocerIgnorePaths` | Paths to exclude from the scan. Any file whose path starts with one of these entries will be ignored. |

!!! info "How Scope and Ignore Interact"
    1. If `BugPocerScopePaths` is defined and non-empty, only files matching a scope path are considered
    2. From the scoped files, any matching `BugPocerIgnorePaths` are excluded
    3. If `BugPocerScopePaths` is empty or omitted, all files are in scope (minus ignores)

### Default Ignore List

BugPoCer automatically excludes common non-production paths. Files containing any of the following in their path are always ignored:

`test`, `mock`, `example`, `dependencies`, `forge-std`, `openzeppelin`, `solmate`, `solady`, `prb-math`, `prb-test`, `murky`, `permit2`, `v3-core`, `v3-periphery`, `v2-core`, `v2-periphery`

!!! note "Difference from Other Olympix Tools"
    BugPoCer does **not** use the general `IgnoredPaths`, `TrustedPaths`, `TrustedVariables`, or `TrustedContracts` options. Use `BugPocerScopePaths` and `BugPocerIgnorePaths` instead.

---

## Scan Report

Each finding in the BugPoCer scan report includes:

### Vulnerability Details

- **Description** — What the vulnerability is and how it can be exploited
- **Severity** — Risk level (High, Medium, or Low)
- **Location** — Affected file and line numbers

### Exploit Demonstration

- **PoC Test** — A ready-to-run Foundry test that reliably triggers the issue
- **Test Location** — Path to the generated test file
- **Summary** — Explanation of how the PoC demonstrates the vulnerability

---

!!! note "Processing Time"
    Scan duration depends on project size and complexity. Larger projects with more complex logic will take longer to analyze.

---

## Need Help?

If you encounter any issues or have questions, reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)
