# Ignore File

## Overview
The `.olympix-ignore.json` file allows users to specify which vulnerabilities should be ignored in specific files and lines within their repository.

You can have multiple ignore `.olympix-ignore.json` files in each sub directory of the workspace and their ignore setting will be aggregated and applied to the results.

Both hidden and unhidden versions of the ignore file are supported:

- `.olympix-ignore.json`
- `olympix-ignore.json`

## File Structure
The `.olympix-ignore.json` file follows a structured JSON format as shown below:

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
    ]
}
```

### Explanation:
- **`IgnoredVulnerabilities`**: A dictionary where each key is a detector slug representing a specific vulnerability type.
    - **`<DETECTOR-SLUG>`**: A string representing the detector slug, e.g., `abi-encode-packed-dynamic-types`. You can get the slug by running the `olympix show-vulnerabilities` command in the CLI.
    - **`<FILENAME>`**: The path to the file where the vulnerability is ignored.
    - **`[<LINENUM>, ...]`**: An array of line numbers in the specified file where the vulnerability is ignored.
<div class="annotate" markdown>
- **`IgnoredPaths`**: An array of filepaths that specify what all paths should the analyzer ignore. 
    - For each of the entries in the array, the analyzer will ignore any filepaths that start with that entry. (1)
</div>
1. Each entry can be thought of as the following regex: `^ENTRY.*`, where the string `ENTRY` is replaced with each entry in the provided array. Any file matching any of these regexes would be ignored. Hence, these paths can be partial paths too, the asterisk at the end is implied, no wildcards are allowed. <br>

!!! note
    All paths in this file should be relative from the project root (and should not start with a `/`).


## Example
Here is an example `.olympix-ignore.json` file:

```json
{
    "IgnoredVulnerabilities" : {
        "abi-encode-packed-dynamic-types" : {
            "src/contracts/FraxlendPairDeployer.sol" : [255, 300, 450],
            "src/contracts/AnotherContract.sol" : [120, 180]
        },
        "reentrancy" : {
            "src/contracts/SafeContract.sol" : [75, 150, 225],
            "src/contracts/CriticalModule.sol" : [90, 200]
        }
    },
    "IgnoredPaths": [
        "src/contracts/external",
        "src/contracts/vendors",
        "src/contracts2/DontScanMe.sol"
    ]
}
```

!!! info
    - It supports multiple **detector slugs**, **files**, and **line numbers**.
    - This ignore file applies **across all Olympix tools**.

## Ignore Comment
In any line of your code that you want to be ignore by the analyzer, you can add the following comments:

1. `//#olympix-ignore` - This will disable this line for all detectors.
2. `//#olympix-ignore-<DETECTOR-SLUG>` - This will only disable that detector for that line.

## Usage
To effectively ignore vulnerabilities, ensure that:

1. The file is committed to the repository root.
2. The specified detector slugs, filenames, and line numbers match the vulnerability reports.


!!! Warning
    Be **extra-confident** before disabling any vulnerabilities, as this could allow bugs to silently pass into production—bugs that might not even exist yet. Ignoring vulnerabilities should only be done after a thorough review to ensure that it does not introduce security risks in the future.
