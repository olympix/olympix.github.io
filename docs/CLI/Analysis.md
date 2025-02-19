# Analysis

This section covers how to perform static analysis using the Olympix CLI and explains the various reporting strategies available.

---

## Finding Vulnerabilities via CLI 

The Olympix CLI allows you to scan your Solidity projects for vulnerabilities quickly and effectively. To get started, navigate to the root directory of your project and run the analysis command. This will inspect your code for known vulnerability patterns.

!!! tip "Quick Start"
    Run the following command in your terminal from the project root:
    
    ```bash
    olympix analyze
    ```

Depending on your project’s structure, the CLI will automatically look for all Solidity files in your root directory. You can also explicitly specify additional directories using the `-p` or `--path` option.

The **`analyze`** command is designed to help you:
- **Identify vulnerabilities:** The tool checks for a wide range of issues such as uninitialized state variables, default visibility problems, and other common pitfalls.
- **Customize your scan:** Use options to narrow down the directories, exclude certain vulnerability checks, or alter the output format.

These features ensure that you can integrate the analyzer into your development workflow or CI/CD pipeline, receiving feedback directly in your terminal or exported to files for further inspection :contentReference[oaicite:0]{index=0}.

---

## Reporting Strategies via CLI

Once the analysis is complete, Olympix offers several ways to view and export the results. The CLI supports four output formats:

### Option 1: Tree
- **Description:** The results are displayed directly in your terminal in a structured tree format.
- **When to Use:** Ideal for a quick overview during development.
- **Default:** This is the default output format if no other option is specified.

### Option 2: JSON
- **Description:** Outputs the results as JSON data.
- **Usage:** Useful when integrating the results into automated tools or further processing.
- **Additional Option:** Use the `-o` or `--output-path` option to write the JSON output to a file.

### Option 3: SARIF
- **Description:** Outputs the analysis results in SARIF (Static Analysis Results Interchange Format).
- **When to Use:** Particularly beneficial if you wish to integrate with GitHub’s Code Scanning tools or other security platforms.
- **Additional Option:** Use the `-o` or `--output-path` option to specify the output file location.

### Option 4: Email
- **Description:** Sends the analysis results in a tabular format directly to your registered email address.
- **When to Use:** Great for receiving detailed reports without needing to navigate the terminal output.

!!! info "Choosing a Reporting Strategy"
    Your choice of reporting format depends on your workflow. For a quick local review, the tree format works well. If you need to integrate the results with other tools or share them with a team, JSON, SARIF, or email options might be more appropriate.

These reporting strategies are designed to cater to both manual review and automated processing, giving you flexibility in how you manage and respond to vulnerability findings.

---