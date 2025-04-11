# Getting Started 

Welcome to the Olympix CLI usage guide! This guide will help you quickly get started with the command-line interface for the Olympix Static Analyzer and Test Generator.

---

## CLI Commands Overview

When you run the Olympix CLI, you have access to several commands:

- **`analyze`**: Perform code analysis  
- **`generate-unit-tests`**: Generate unit tests  
- **`generate-mutation-tests`**: Generate mutation tests  
- **`login`**: Request access and log in to your account  
- **`show-vulnerabilities`**: Show the vulnerability types that the analyzer aims to find  
- **`version`**: Show CLI version

---

## Analysis Options

When using the `analyze` command, you can customize the analysis with the following options:

- **`-w | --workspace-path`**  
  Defines the root project directory path. This helps in providing more accurate vulnerability analysis.  
  *Default:* current directory

- **`-p | --path`**  
  Defines the Solidity project directory path to be analyzed. Can be used multiple times.  
  *Default:* `'contracts'` and `'src'` directories if they exist, otherwise the workspace directory

- **`-f | --output-format`**  
  Defines the result output format. Supported formats: `tree`, `json`, `sarif`, `email`.  
  *Default:* `tree`

- **`-o | --output-path`**  
  Defines the result output directory path (enabled only for `json` and `sarif` formats).  
  *Default:* Results are shown directly in the terminal

- **`--no-<vulnerability id>`**  
  Defines the vulnerabilities to be ignored. Can be used multiple times.  
  *Default:* Ignores nothing

---

## Unit Tests Generation Options

When generating unit tests, you can use these options:

- **`-w | --workspace-path`** Defines the root project directory path.  
  *Default:* current directory

- **`-env | --include-dot-env`**: If included, sends the env file data along with smart contracts (This is to pass secrets such as private keys/RPC urls/API keys etc. which are often need for fork testing). To specify a custom env file, include the --env-file argument.

- **`--env-file`**: Defines the path of the file containing the environment variables. Make sure to follow foundry's .env format guidelines. Doesn't do anything if '--include-dot-env' is not set.
  *Default*: `.env`

- **`-ext, --extension`**: This allows you to specify additional file extensions to be included in the analysis. You can use this option multiple times to add more extensions. For example: `--extra-extension .json --extra-extension .txt`. By default, only `.sol/.t.sol` and/or `foundry.toml` files are uploaded.

- **`-ca | --confirm-all`**  
  Confirm as 'yes' for all interactive questions.

---

## Mutation Tests Generation Options

When generating mutation tests, you have the following options:

- **`-w | --workspace-path`**  
  Defines the root project directory path.  
  *Default:* current directory

- **`-p | --path`**  
  Defines the Solidity file path to run the mutation tests. Can be used multiple times.

- **`-t | --timeout`**  
  Sets a timeout (in seconds) for each mutant. This prevents infinite loops or hangs.  
  *Default:* 300 seconds  
  *Allowed Range:* 10 - 500 seconds

- **`-env | --include-dot-env`**: If included, sends the env file data along with smart contracts (This is to pass secrets such as private keys/RPC urls/API keys etc. which are often need for fork testing). To specify a custom env file, include the --env-file argument.

- **`--env-file`**: Defines the path of the file containing the environment variables. Make sure to follow foundry's .env format guidelines. Doesn't do anything if '--include-dot-env' is not set.
  *Default*: `.env`
- **`-ext, --extension`**: This allows you to specify additional file extensions to be included in the analysis. You can use this option multiple times to add more extensions. For example: `--extra-extension .json --extra-extension .txt`. By default, only `.sol/.t.sol` and/or `foundry.toml` files are uploaded.
---

## Usage Examples

```bash
# Analyze command
analyze [-w | --workspace-path <workspace directory>] [-p | --path <analysis directory>] [-f | --output-format <output format>] [-o | --output-path <output directory>] [--no-<vulnerability id>]

# Generate unit tests
generate-unit-tests [-w | --workspace-path <workspace directory>] [-ca | --confirm-all] [-env | --include-dot-env] [--env-file <env file path>] [-ext | --extension .<extension-to-include>]

# Generate mutation tests
generate-mutation-tests [-w | --workspace-path <workspace directory>] [-p | --path <solidity file path>] [-t | --t <timeout>] [-env | --include-dot-env] [--env-file <env file path>] [-ext | --extension .<extension-to-include>]

# Login
login [-e | --email <user email>]
```

---

## Helpful Links

- **[Installation](../Installation.md)**  
  Get started by installing the CLI binaries and the VSCode extension.

- **[Unit Test Generation](./Unit%20Testing.md)**  
  Learn how to generate unit tests for your smart contracts using the Olympix Unit Test Generator.

- **[Mutation Tests Generation](./Mutation%20Testing.md)**  
  Find out how to generate mutation tests to assess your unit test quality.

---

With these commands and options at your disposal, you're well-equipped to leverage Olympix for efficient static analysis and robust test generation. If you have any questions, our support team is ready to help at [contact@olympix.ai](mailto:contact@olympix.ai).

