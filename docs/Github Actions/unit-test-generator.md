# Unit Test Generation

The Olympix Test Generation action enables you to integrate our test generator tool directly into your GitHub CI/CD workflows. By using this action, you can automatically generate unit tests for your Solidity projects, ensuring code correctness and reliability—all without manually writing tests.

---

## Overview

The Olympix Test Generation action performs code analysis and test generation for Solidity projects. It allows developers to focus on building robust smart contracts while the tool handles test creation during CI runs.

You can access this action from the [GitHub Marketplace](https://github.com/marketplace/actions/olympix-unit-test-generator) or visit the [GitHub repository](https://github.com/olympix/test-generator) for more details.

---

## Features

- **Unit Tests Generation:**  
  Automatically generate unit tests to help verify the functionality of your smart contracts.

- **CI/CD Integration:**  
  Seamlessly integrate the test generation process into your GitHub workflows.

- **Email Notifications:**  
  Once test generation completes, results are sent to the email address associated with your Olympix API token.

---

## Getting Started

1. **Set Up API Token:**
      - Add a GitHub repository secret with your Olympix API token.
      - Ensure an environment variable `OLYMPIX_API_TOKEN` is set in your workflow using the secret.

2. **Add the Test Generator Action:**
      - Include the `olympix/test-generator` action in your workflow.

***Optional: Add Generated Tests Directly to Your Repository***

1. **Configure GitHub Access:**
      - Create a GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
      - Add a GitHub repository secret with this token.
      - Set an environment variable `OLYMPIX_GITHUB_ACCESS_TOKEN` in your workflow with the secret value.

2. **Branch Setup:**
      - Create a branch named `opix-unit-test` where the generated tests will be committed.

---

## Usage Examples

### Example 1: Triggering Test Generation on PR Merge

This workflow triggers test generation whenever a pull request is merged from the `main` branch to the `opix-unit-test` branch:

```yaml
name: Unit Test Generation Workflow
on:
  pull_request:
    types:
      - closed
      
jobs:
  test-generation:
    if: github.event.pull_request.merged == true && github.head_ref == 'main' && github.base_ref == 'opix-unit-test'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18.17.1

      - name: Install dependencies
        run: npm install
      
      - name: Unit Test Generator
        uses: olympix/test-generator@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
          OLYMPIX_GITHUB_ACCESS_TOKEN: ${{ secrets.OLYMPIX_GITHUB_TOKEN }}
```

### Example 2: Triggering on Specific Commit Message

This example triggers the workflow on each commit that contains the string `OPIX-GEN-UNIT-TEST`. It installs dependencies, runs `forge install`, and then triggers the test generator:

```yaml
name: Unit Test Generation Workflow
on:
  push

jobs:
  test-generation:
    if: contains(github.event.head_commit.message, 'OPIX-GEN-UNIT-TEST')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with: 
          submodules: recursive

      - name: Install dependencies
        run: npm install
     
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Run forge install 
        run: |
          forge install

      - name: Unit Test Generator
        uses: olympix/test-generator@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
          OLYMPIX_GITHUB_ACCESS_TOKEN: ${{ secrets.OLYMPIX_GITHUB_TOKEN }}
```

Once triggered, the workflow starts the test generation process and sends the results via email. The generation time will vary depending on the size and complexity of your contracts.
