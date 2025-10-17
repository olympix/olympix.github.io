
# Unit Test Generation

Welcome to the **Olympix Unit Test Generator** documentation! This guide will walk you through how to automatically generate unit tests (and even mutation tests) for your Solidity smart contracts using the Olympix CLI. Follow these steps to set up your environment and get started.

---

## Overview

The Olympix Unit Test Generator works in tandem with the [Foundry](https://book.getfoundry.sh/) toolchain to create:

- **Unit tests** for your contracts
- **Mutation tests** to assess the quality of your existing tests

> 💡 **Tip:** Running the test generator consumes Olympix credits. The credit usage details will be included in the email with your test results.

---

## Prerequisites

Before running the generator, ensure you have completed the following:

!!! info "Forge Configuration"
    - Verify that your Forge remappings are correctly set up for your project.  
    - [Learn more about Forge remappings](https://book.getfoundry.sh/projects/dependencies#remapping-dependencies).

---

## Step-by-Step Guide

### 1. Ensure Your Forge Remappings Are Accurate

Your project must compile successfully with Forge. Double-check your remappings in the project configuration to avoid any compilation issues.

### 2. Create `OlympixUnitTest.sol`

A special file named **`OlympixUnitTest.sol`** is required in your Foundry test directory. This file contains the base contract for your unit tests.  
   
!!! note "Action Required"
    Copy and paste the following content into `OlympixUnitTest.sol` to set up the foundation for your tests.
    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    abstract contract OlympixUnitTest {
        constructor(string memory _name) {}
    }

    ```
### 3. Create Your Unit Test Skeleton

For each contract you wish to test, create a unit test file that adheres to the Forge naming convention:  
**`<contractName>.t.sol`**

Your test skeleton should:
- Import the contract you intend to test
- Import the `OlympixUnitTest` contract from `OlympixUnitTest.sol`
- Define any required state variables
- Include a `setUp()` function to initialize the testing environment.
- Any helper functions/example tests that you want the test generator to build off of.
!!! note
    Good tests require a good setup function, which correctly initializes all relevant smart contracts.

Example unit test skeleton
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../contracts/MyContract.sol";       // Adjust the path as needed
import "./OlympixUnitTest.sol";

contract MyContractTest is OlympixUnitTest("MyContract") {
    MyContract public myContract;

    // setUp() is run before each test
    function setUp() public {
        myContract = new MyContract();
    }

    // Example test function
    function testExample() public {
        // Example assertion using a helper from OlympixUnitTest
        uint expected = 42;
        uint actual = myContract.someFunction();
        assertEqual(expected, actual);
    }
}

```

For a detailed example, check out this [YouTube tutorial](https://youtu.be/x7Apoq2PgT0).

### 4. Run the Unit Test Generator

Navigate to the root folder of your Solidity project and execute the following command in your terminal:

```bash
olympix generate-unit-tests -w .
```

This command launches an interactive mode where you can select the contracts for which unit tests should be generated. After a brief processing period, the results will be emailed to your registered address.

!!! info "What to Expect"
    - **Email Notification:** You will receive an email containing all the generated unit tests along with statistics.
    - **Credit Consumption:** Remember, using this feature consumes Olympix credits.

### 5. Review and Utilize the Results
Once you receive the email:<br>

- **Examine** the generated unit tests.<br>
- **Integrate** them into your project.<br>
- **Iterate** on the tests as needed to improve coverage.

---

!!! tip "Including env variables"
    We provide the ability to pass environment variables with your solidity files. If you would like to provide `RPC URLs`, `API keys`, `private keys`, etc. You can do so by using the `-env` flag which will read these parameters from your `.env` file. You can also specify a custom filepath for your `env` file using the `--env-file` flag.
    Refer here for format guidelines: `https://book.getfoundry.sh/cheatcodes/env-string`.


    Note: If you do require passing `env variables` for your `forge` run, this is the recommended way to do it. We encrypt all communication of this file with an extra layer of RSA on top of the regular encryption.


## Need Help?

If you encounter any issues or have questions, feel free to reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)

Happy testing! 🎉