# Mutation Testing

Mutation testing evaluates the effectiveness of your test suite by introducing small, systematic changes (mutations) to your source code and checking if your tests detect them. While code coverage tells you what lines are executed, mutation testing tells you how effective your tests are at catching actual bugs.

---

## Why Mutation Testing?

Traditional metrics like code coverage can provide a false sense of security. Having 100% coverage doesn't mean your tests are meaningful - they might have weak assertions or test the wrong things.

Mutation testing provides a more meaningful metric by:

1. **Measuring test effectiveness** - Do your tests actually catch bugs?
2. **Identifying weak tests** - Which tests pass even when code is broken?
3. **Forcing better assertions** - Encourages tests that verify behavior, not just execution
4. **Discovering edge cases** - Finds scenarios you haven't considered

---

## Security Implications

In smart contract development, mutation testing is critical for security. Many historical exploits occurred due to seemingly minor changes in business logic that weren't caught by existing test suites.

**Olympix mutation operators are derived from real-world smart contract exploits.** Each operator represents a pattern of change that has historically led to security incidents in production contracts.

---

## How It Works

1. **Parse** - The tool analyzes your Solidity source code
2. **Mutate** - Small changes are applied to create "mutants"
3. **Test** - Your test suite runs against each mutant
4. **Report** - Results show which mutants were "killed" (detected) vs "survived" (undetected)

### Interpreting Results

| Outcome | Meaning |
|---------|---------|
| **Killed** | Your tests detected the mutation (good) |
| **Survived** | Your tests passed despite the bug (bad - improve your tests) |
| **Timeout** | Tests took too long (may indicate infinite loop) |

A high **mutation score** (killed / total mutants) indicates an effective test suite.

---

## Mutation Operators

Olympix applies 14 types of mutations, each representing a real vulnerability pattern:

### 1. Arithmetic Operator Mutations

```solidity
// Original
amount + tax
// Mutated
amount - tax
```

Swaps: `+` with `-`, `%` with `/`, and vice versa.

### 2. Comparison Operator Mutations

```solidity
// Original
amount > 0
// Mutated
amount < 0
```

Swaps: `==` with `!=`, `>` with `<`, `>=` with `<`, `<=` with `>`.

### 3. Logical Operator Mutations (AND/OR)

```solidity
// Original
require(isEnabled && amount > 100)
// Mutated
require(isEnabled || amount > 100)
```

Swaps `&&` with `||` and vice versa.

### 4. Condition Negation

```solidity
// Original
if (taxEnabled)
// Mutated
if (!taxEnabled)
```

Adds or removes the `!` operator.

### 5. Ternary Conditional Mutations

```solidity
// Original
amount < 100 ? amount : 100 - tax
// Mutated
amount < 100 ? 100 - tax : amount
```

Swaps the true and false branches.

### 6. Function Call Mutations (delegatecall to call)

```solidity
// Original
(address).delegatecall(data)
// Mutated
(address).call(data)
```

### 7. Hex Literal Mutations

```solidity
// Original
0xabcd1234
// Mutated to 0 or another hex literal in scope
0x0
```

### 8. Remove emit Statement

```solidity
// Original
emit Transfer(msg.sender, recipient, amount);
// Mutated
// (removed)
```

### 9. Remove delete Operator

```solidity
// Original
delete myStruct;
// Mutated
// (removed)
```

### 10. Storage Location Mutations

```solidity
// Original
uint[] storage x;
// Mutated
uint[] memory x;
```

### 11. Assignment Operator Replacement

```solidity
// Original
balances[msg.sender] += amount;
// Mutated
balances[msg.sender] -= amount;
```

### 12. State Variable Initialization

```solidity
// Original
bool public taxEnabled = true;
// Mutated
bool public taxEnabled = false;
```

Also mutates integers (e.g., `1000` to `1001`) and strings.

### 13. Modifier Removal

```solidity
// Original
function toggleTax() public onlyOwner { ... }
// Mutated
function toggleTax() public { ... }
```

### 14. Address Swap

```solidity
// Original
address(0xaaa...).call();
// Mutated
address(0xbbb...).call();  // another address in scope
```

---

## Prerequisites

The mutation test generator requires:

- A Foundry project with existing unit tests
- Tests that pass before mutation testing begins

No additional dependencies are needed.

---

## Timeout Configuration

Some mutations can cause infinite loops or extremely slow execution. Configure a timeout per mutant to prevent hanging:

- **Default**: 300 seconds
- **Range**: 10 - 500 seconds
- **Recommendation**: Set slightly higher than your normal test suite execution time

---

## Using Mutation Testing

=== "CLI"
    See [CLI Reference](../CLI/index.md#generate-mutation-tests) for command-line options.

    ```bash
    olympix generate-mutation-tests -p src/MyContract.sol
    ```

=== "GitHub Actions"
    See [GitHub Actions](../Github%20Actions/index.md#mutation-test-generation) for CI/CD integration.

    ```yaml
    - uses: olympix/mutation-test-generator@main
      env:
        OLYMPIX_API_TOKEN: ${{ secrets.OLYMPIX_API_TOKEN }}
      with:
        args: -p src/MyContract.sol
    ```
