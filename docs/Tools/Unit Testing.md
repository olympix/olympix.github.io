# Unit Test Generation

Olympix automatically generates unit tests for your Solidity smart contracts, targeting branch coverage to help verify contract functionality. The generated tests are compatible with the Foundry testing framework.

---

## How It Works

The Olympix Unit Test Generator analyzes your smart contracts and generates test cases that:

1. **Target branch coverage** - Tests are designed to exercise different code paths
2. **Use your existing setup** - Builds on your `setUp()` function and existing test structure
3. **Follow Foundry conventions** - Output is compatible with `forge test`

After generation, results are emailed to your registered address with:

- Generated test files
- Coverage statistics
- Credit consumption details

---

## Prerequisites

Before generating unit tests, ensure your project meets these requirements:

### 1. Foundry Project Structure

Your project must be a valid Foundry project that compiles successfully.

```
my-project/
  contracts/        # or src/
    MyContract.sol
  test/
    MyContract.t.sol
  foundry.toml
```

### 2. Correct Remappings

Verify your Forge remappings are correctly configured. The generator needs to resolve all imports.

```toml title="foundry.toml"
[profile.default]
src = "contracts"
test = "test"
libs = ["lib"]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
]
```

See [Foundry remappings documentation](https://book.getfoundry.sh/projects/dependencies#remapping-dependencies) for details.

### 3. OlympixUnitTest Base Contract

Create a file named `OlympixUnitTest.sol` in your test directory:

```solidity title="test/OlympixUnitTest.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract OlympixUnitTest {
    constructor(string memory _name) {}
}
```

This base contract is required for the generator to identify which contracts to generate tests for.

---

## Test Skeleton Structure

For each contract you want to test, create a test skeleton that the generator will build upon:

```solidity title="test/MyContract.t.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../contracts/MyContract.sol";
import "./OlympixUnitTest.sol";

contract MyContractTest is OlympixUnitTest("MyContract") {
    MyContract public myContract;

    function setUp() public {
        // Initialize your contract and any dependencies
        myContract = new MyContract();
    }

    // Optional: Add example tests for the generator to learn from
    function testExample() public {
        uint expected = 42;
        uint actual = myContract.getValue();
        assertEq(expected, actual);
    }
}
```

### Key Elements

| Element | Purpose |
|---------|---------|
| `OlympixUnitTest("ContractName")` | Identifies this as a test target |
| `setUp()` | Initializes the testing environment |
| State variables | Declares contracts and test fixtures |
| Example tests | (Optional) Helps generator understand testing patterns |

!!! tip "Quality Setup Matters"
    The quality of generated tests depends heavily on your `setUp()` function. Ensure it properly initializes all contracts and their dependencies.

---

## Environment Variables

If your tests require environment variables (RPC URLs, API keys, private keys for fork testing), you can include them securely:

- Pass your `.env` file using the `-env` flag
- Specify a custom env file path with `--env-file`

All environment variable data is encrypted with an additional RSA layer on top of standard encryption.

See [Foundry environment variables](https://book.getfoundry.sh/cheatcodes/env-string) for format guidelines.

---

## Credit Consumption

Unit test generation consumes Olympix credits. The exact consumption depends on:

- Number of contracts being tested
- Complexity of the contracts
- Number of functions to cover

Credit usage details are included in the results email.

---

## Using Unit Test Generation

=== "CLI"
    See [CLI Reference](../CLI/index.md#generate-unit-tests) for command-line options.

    ```bash
    olympix generate-unit-tests -w .
    ```

=== "GitHub Actions"
    See [GitHub Actions](../Github%20Actions/index.md#unit-test-generation) for CI/CD integration.

    ```yaml
    - uses: olympix/test-generator@main
      env:
        OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
    ```

