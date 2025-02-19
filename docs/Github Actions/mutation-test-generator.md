# Mutation Test Generation

The Olympix Mutation Test Generation action allows you to integrate mutation testing into your CI/CD workflows on GitHub. This action automates the creation of mutation tests for your Solidity projects, helping ensure that your existing unit tests are robust and capable of catching code mutations.

---

## Overview

The Olympix Mutation Test Generation action leverages Olympix's powerful test generator tool to run mutation tests on your smart contracts. By integrating this into your CI workflow, you can focus on developing your smart contracts while the action handles the mutation testing process during your builds.

You can access this action from the [GitHub Marketplace](https://github.com/marketplace/actions/olympix-mutation-test-generator) or visit the [GitHub repository](https://github.com/olympix/mutation-test-generator) for more details.

---

## Features

- **Mutation Tests Generation:**  
Automatically generate mutation tests to evaluate the effectiveness of your unit tests and enhance test coverage.
  
- **CI/CD Integration:**  
  Seamlessly integrate mutation testing into your GitHub workflows to continuously assess test quality.
  
- **Automated Reporting:**  
  Once the mutation tests are complete, results are emailed to the address associated with your Olympix API token, including details about which mutants were killed or survived.

---

## Getting Started
<div class = "annotate" markdown>
1. **Set Up API Token:**
      - Add a GitHub repository secret with your Olympix API token.
      - Set an environment variable `OLYMPIX_API_TOKEN` in your workflow using this secret.

2. **Add the Mutation Test Generator Action:**
      - Include the `olympix/mutation-test-generator` action in your workflow.
3. **Configure GitHub Access (Optional) (1):**
      - For additional integration, add a GitHub repository secret with your GitHub personal access token.
      - Set an environment variable `OLYMPIX_GITHUB_ACCESS_TOKEN` in your workflow with this token.
</div>
1. This allows the mutation-tester to access your private GitHub repository.

---

## Usage Example

Below is an example workflow that triggers on each commit containing the string `OPIX-GEN-MUTATION-TESTS`. This workflow installs the necessary dependencies with `npm install` and `forge install` , and then triggers the mutation test generator with the required paths for each target Solidity contract.

```yaml
name: Mutation Test Generation Workflow
on:
  push

jobs:
  mutation-test-generation:
    if: contains(github.event.head_commit.message, 'OPIX-GEN-MUTATION-TESTS')
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

      - name: Mutation Test Generator
        uses: olympix/mutation-test-generator@main
        env:
          OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
          OLYMPIX_GITHUB_ACCESS_TOKEN: ${{ secrets.OLYMPIX_GITHUB_TOKEN }}
        with:
          args: -p src/subjectContract1.sol -p src/subjectContract2.sol
```
The workflow will start, and an email with the mutation test results will be sent to the address associated with your API token. The generation time will vary based on the size and complexity of your contracts.
