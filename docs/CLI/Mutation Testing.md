# Mutation Test Generation

## Overview

Mutation testing is a powerful technique for evaluating the effectiveness of your test suite by introducing small, systematic modifications (mutations) to your source code and verifying if your tests can detect these changes. While code coverage tells you what lines of code are executed by your tests, mutation testing tells you how effective your tests are at catching actual bugs.

### Why Mutation Testing Matters

Traditional metrics like code coverage can provide a false sense of security. Having 100% coverage doesn't necessarily mean your tests are meaningful—they might assert the wrong things or have weak assertions. Mutation testing provides a more meaningful metric by:

1.  Measuring test suite effectiveness over time  
2.  Identifying areas where tests might be insufficient  
3.  Forcing developers to write more thorough assertions  
4.  Discovering edge cases that weren't previously considered  

### Security Implications

In blockchain and smart contract development, mutation testing is particularly crucial for security. Many historical smart contract hacks occurred due to seemingly minor changes in business logic that weren't caught by existing test suites. Our mutation operators are specifically derived from real-world smart contract exploits—each mutation pattern in our tool corresponds to actual changes that led to significant security breaches in production contracts.

---

## Installation & Requirements

The mutation test generator is designed to be dependency-free and works with any Forge project. The only prerequisite is having a Forge project with unit tests.

:white_check_mark: No external dependencies  
:white_check_mark: Works with standard Forge unit tests out of the box.

---

## CLI Usage

```bash
generate-mutation-tests [-w <workspace>] [-p <solidity-file>] [-t <timeout>]

Options
	-w, --workspace-path: Root project directory path (default: current directory)
	-p, --path: Solidity file path to mutate (can be specified multiple times)
	-t, --timeout: Timeout in seconds for each mutant test run (default: 300s, range: 10-500s)
    -env, --include-dot-env: If included, sends the env file data along with smart contracts (This is to pass secrets such as private keys/RPC urls/API keys etc. which are often need for fork testing). To specify a custom env file, include the --env-file argument.
    --env-file: Defines the path of the file containing the environment variables. Make sure to follow foundry's .env format guidelines. Doesn't do anything if '--include-dot-env' is not set.

	Tip: The timeout option is crucial as some mutations can cause infinite loops in test execution. Set this to slightly higher than your normal test suite execution time.
```

!!! tip "Including env variables"
    We provide the ability to pass environment variables with your solidity files. If you would like to provide `RPC URLs`, `API keys`, `private keys`, etc. You can do so by using the `-env` flag which will read these parameters from your `.env` file. You can also specify a custom filepath for your `env` file using the `--env-file` flag.
    Refer here for format guidelines: `https://book.getfoundry.sh/cheatcodes/env-string`.


    Note: If you do require passing `env variables` for your `forge` run, this is the recommended way to do it. We encrypt all communication of this file with an extra layer of RSA on top of the regular encryption.

## Mutation Operators

Our mutation operators are directly inspired by real-world smart contract exploits. Each operator represents a pattern of change that has historically led to security incidents.

Below is a comprehensive list of all currently supported operators.
<div class = "annotate" markdown>
### Arithmetic Operator Mutations (1)



```solidity 
// Original
amount + tax
// Mutated
amount - tax
```


###  Comparison Operator Mutations (2)
```solidity 
// Original
amount > 0
// Mutated
amount < 0
```
###  Logical Operator Mutations (AND ↔ OR) (3)
```solidity 
// Original
require(isEnabled && amount > 100)
// Mutated
require(isEnabled || amount > 100)
```

###  Condition Negation Mutations (4)
```solidity 
// Original
if (taxEnabled)
// Mutated
if (!taxEnabled)
```
###  Ternary Conditional Mutations (5)
```solidity 
// Original
amount < 100 ? amount : 100 - tax
// Mutated
amount < 100 ? 100 - tax : amount
```
###  Function Call Mutations (delegatecall → call) (6)
```solidity 
// Original
(address).delegatecall(data)
// Mutated
(address).call(data)
```
### 

###  Hex Number Literal Mutations (7)
```solidity 
// Original
0xabcd1234
// Mutated 1 (→ 0)
0x0
// Mutated 2 (→ Another Random Hex)
0xdef12345
```
###  Remove emit Statement (8)
```solidity 
// Original
emit Transfer(msg.sender, recipient, amount);
// Mutated
// (empty string)
```
### 

###  Remove delete Operator (9)
```solidity 
// Original
delete myStruct;
// Mutated
// (empty string)
```
### 

### Storage Location Mutations (10)
```solidity 
// Original
uint[] storage x;
// Mutated
uint[] memory x;
```

### Variable Assignment Operator Replacement (11)
```solidity 
// Original
balances[msg.sender] += amount;
// Mutated
balances[msg.sender] -= amount;
```
### State Variable Initialization Changes (12)
```solidity 
// Original
bool public taxEnabled = true;
// Mutated
bool public taxEnabled = false;

// Original
uint public maxSupply = 1000;
// Mutated
uint public maxSupply = 1001;

// Original
string public greeting = "Hello";
// Mutated
string public greeting = "Mutation text"
```
### 

### Modifier Removal Mutations (13)
```solidity 
// Original
function toggleTax() public onlyOwner {
    // ...
}

// Mutated
function toggleTax() public {
    // ...
}
```
### 

### Address swap Mutations (14)
```solidity
// Original
address(0xaaaaaaaaaaaaaaaaaaaaa).call();
// Mutated
address(0xbbbbbbbbbbbbbbbbbbbbb).call(); // where 0xbbbbbbbbbbbbbbbbbbbbb is another address in the current function
```
### 
</div>
1.	Arithmetic Operator Mutations:
    - `+` ↔ `-`
    - `%` ↔ `/`
    - `-` ↔ `+`
    - `/` ↔ `%` 
2.	Comparison Operator Mutations: Inverts comparison operators:
    -	`==` ↔ `!=`
    -	`> `↔ `<`
    -	`>=` ↔ `<`
    -	`<=` ↔ `>`
3.	Logical Operator Mutations (AND ↔ OR): Swaps logical operators:
    -	`&&` ↔ `||`
    -	`||` ↔ `&&`
4.	Condition Negation Mutations: Negates a condition by adding or removing the ! operator.
5.	Ternary Conditional Mutations: Swaps the `true` and `false` branches in a ternary expression `(?:)`.
6.	Function Call Mutations (`delegatecall` → `call`): Replaces `delegatecall` with `call`.
7.	Hex Number Literal Mutations:
    -	Replaces any hex literal with `0x0`.
    -	Replaces a hex literal with a different randomly chosen hex literal found in the same function.
8.	Remove emit Statement: Removes the `emit` statement.
9.	Remove delete Operator: Removes the `delete` statement.
10.	Storage Location Mutations: Swaps the variable declaration storage location:
    -	`storage` ↔ `memory`
11.	Variable Assignment Operator Replacement: Swaps `+=` with `-=` (and vice versa).
12.	State Variable Initialization Changes: Mutates state variable initial values based on type.
13.	Modifier Removal Mutations: Removes function modifiers.
14.	Address Swap Mutations: Swaps addresses in function calls.

## Security Foundation

Each mutation operator in this tool was carefully selected based on extensive analysis of historical smart contract exploits. By studying security incidents and identifying the precise commits that introduced vulnerabilities, we’ve created a comprehensive set of mutations that represent real-world attack vectors.

This approach ensures that your test suite is validated against realistic threat models rather than purely theoretical vulnerabilities.
