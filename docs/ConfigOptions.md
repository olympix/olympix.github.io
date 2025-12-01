# Configuration and Ignore Options

## Overview
Olympix tools can be configured using a JSON file at the root of your repository. This allows you to fine-tune the analysis by ignoring specific vulnerabilities, files, or paths, and by marking certain contracts, variables, and paths as "trusted."

## File Structure
The `olympix-config.json` file follows the structure below. All paths should be relative to the project root.

```json
{
    "IgnoredVulnerabilities" : {
        "<DETECTOR-SLUG>" : {
            "<FILENAME>" : [<LINENUM>, ...]
        }, ...
    },
    "IgnoredPaths" : [
        "<PATH_PATTERN>",
        ...
    ],
    "TrustedVariables": {
        "<DETECTOR-SLUG>" : {
            "<FILENAME>" : [<LINENUM>, ...]
        }, ...
    },
    "TrustedContracts": {
        "<DETECTOR-SLUG>" : ["<CONTRACT_NAME>", ...]
    },
    "TrustedPaths": [
        "<PATH_PATTERN>",
        ...
    ]
}
```

### Key Explanations
* **`IgnoredVulnerabilities`**: A dictionary to ignore specific vulnerability types.
    * **`<DETECTOR-SLUG>`**: The unique identifier for the vulnerability (e.g., `reentrancy`). You can get a list of all slugs by running the `olympix show-vulnerabilities` command.
    * **`<FILENAME>`**: The path to the file containing the vulnerability.
    * **`[<LINENUM>, ...]`**: An array of line numbers in that file to ignore for that specific vulnerability.

* **`IgnoredPaths`**: An array of filepaths or directory paths to completely exclude from the analysis. The analyzer will ignore any file path that starts with one of the provided patterns.

* **`TrustedPaths`**: An array of filepaths that should be considered trusted. This can help reduce the severity or number of reported issues from known safe code, such as audited third-party libraries.

* **`TrustedVariables`**: A dictionary used to mark specific variables (at specific lines) as trusted for a given check. This is particularly useful for silencing findings like `unfuzzed-variables` where a variable is intentionally left in a certain state. The structure is identical to `IgnoredVulnerabilities`.

* **`TrustedContracts`**: A dictionary used to mark entire contracts as trusted for a specific detector. This is useful when a contract's design is known to be safe against a particular vulnerability (e.g., a contract that is non-reentrant by design).

## Example

```json title="olympix-config.json"
{
  "IgnoredVulnerabilities": {
    "reentrancy" : {
      "src/reentrancy/CEI.sol" : [21]
    },
    "locked-ether": {
      "src/reentrancy/CEILib.sol" : [32]
    }
  },
  "TrustedVariables": {
    "unfuzzed-variables" : {
      "src/unfuzzed-state-variables/main.sol" : [5]
    }
  },
  "TrustedContracts": {
    "reentrancy" : ["ChecksEffectsInteractionsNamespacedLibContract"]
  },
  "IgnoredPaths": ["src/signature-replay/"],
  "TrustedPaths": ["src/low-level-call-parameters-verified/"]
}
```

### info
- The configuration file **must** be located at the **workspace root**.
- It supports multiple detector slugs, files, contracts, and line numbers.
- The settings apply **across all Olympix tools**.

## Usage

To use these features, ensure that:

1. Your configuration file is placed at the **workspace root** directory.
2. The specified detector slugs, filenames, and line numbers match the vulnerability reports exactly.
3. All file paths are relative to the project root.

## Supported File Names

The tools will recognize any of these filenames at your project's root:

| Filename | Description |
|----------|-------------|
| `olympix-config.json` | Recommended config file |
| `.olympix-config.json` | Hidden config file variant |
| `olympix-ignore.json` | Legacy ignore file |
| `.olympix-ignore.json` | Hidden legacy ignore file |

If multiple files are present, their configurations will be merged.

--- 

!!! Warning Be extra-confident before disabling any vulnerabilities, as this could allow bugs to silently pass into production—bugs that might not even exist yet. Ignoring vulnerabilities should only be done after a thorough review to ensure that it does not introduce security risks in the future.