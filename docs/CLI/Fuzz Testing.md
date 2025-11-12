# Fuzz Test Generation

## Overview

Olympix Fuzz Testing is a specialized security tool designed for smart contracts. The fuzzer integrates an in-house symbolic execution engine to reason about code behavior, explore every possible path and uses SMT solving to generate concrete inputs that trigger specific execution paths. Once paths are explored, the tool applies a set of attack strategies to automatically generate proof-of-concepts for potential exploits.

### Why Fuzz Testing Matters

Traditional fuzzing can miss vulnerabilities because it depends on random mutations to reach different paths. By leveraging an in-house symbolic execution and proof-of-concepts generation, our tool achieves path-aware fuzzing, allowing it to:

1.  Detecting vulnerabilities that depend on complex input conditions
2.  Exploring all reachable execution paths, including deep analysis of inner function calls
3.  Performing inter-function analysis to reach paths that depend on state changes from prior function calls
4.  Building proof-of-concepts demonstrating real exploitability

### Security Implications

In blockchain security, logic errors or validation misses can lead to severe financial losses. Olympix Fuzz Testing tool helps developers identify these issues early by simulating real-world attack scenarios.

The integrated attack strategy engine applies heuristics and exploit templates inspired by real vulnerabilities such as reentrancy, price manipulation, or access control bypasses to validate whether discovered conditions are exploitable in practice.

Each generated proof-of-concept provides a concrete demonstration of a potential exploit path, giving teams clear, actionable insight into their contract’s weakest points before deployment.

### How it works

<div align="center"">
``` mermaid
    flowchart TD
        %% Styles
        classDef node fill:#f9f9ff,stroke:#6a0dad,stroke-width:1px;
        classDef path stroke:#ae6ae0,stroke-width:2px;

        %% Nodes
        A[**User**]:::node --> B[**Fuzzing Application**]:::node
        B --> C[**Symbolic Execution Engine**<br/>Performs path exploration over the IR and generates inputs to trigger each path]:::node
        C --> D[**Exploit Detection**<br/>Apply attack strategies to reproduce exploits]:::node
        D --> E[**Email Report**]:::node

        %% Paths
        class A,B,C,D path;
```   
</div>

### Coverage Modes

Take this function as example:

```
function example(uint256 a, uint256 b) external {
    if(a > 100) {
        //Do something
    }

    if(b > 100) {
        //Do something
    }
}
```   

**Path Coverage**: 4 paths explored, covering all branch combinations

<div align="center"">
``` mermaid
flowchart TD
    %% Styles
    classDef node fill:#f9f9ff,stroke:#6a0dad,stroke-width:1px;
    classDef path stroke:#ae6ae0,stroke-width:2px;

    %% Nodes
    A([Start]):::node --> B{a > 100}:::node
    B -->|True| C{b > 100}:::node
    B -->|False| D{b > 100}:::node

    C -->|True| E([End]):::node
    C -->|False| F([End]):::node
    D -->|True| G([End]):::node
    D -->|False| H([End]):::node

    %% Paths
    class A,B,C,D,E,F,G,H path;
```
</div>

**Branch Coverage**: 1 path explored, covering all branches with minimum number of paths needed

<div align="center"">
``` mermaid
flowchart TD
    %% Styles
    classDef node fill:#f9f9ff,stroke:#6a0dad,stroke-width:1px;
    classDef path stroke:#ae6ae0,stroke-width:2px;

    %% Nodes
    A([Start]):::node --> B{a > 100}:::node
    B -->|True| C{b > 100}:::node
    C -->|True| D[End]:::node
    
    %% Paths
    class A,B,C,D path;
```
</div>

---

## Installation & Requirements

The fuzz testing generator is designed to be dependency-free and works with any Forge project.

:white_check_mark: No external dependencies  
:white_check_mark: Works with standard Forge

---

## CLI Usage

```none
generate-fuzz-tests [-w <workspace>] [-p <solidity-file>]

Options
	-w, --workspace-path: Root project directory path (default: current directory)

	-p, --path: Solidity file path to fuzz (can be specified multiple times)

    -cm, --coverage-mode: Exploration strategies: 
        `path`: Explores all distinct paths, including every branch combination
        `branch`: Covers all branches using the fewest paths possible

    -cl, --chain-length: Number of sequential function calls per exploration. High values can drastically increase analysis time. Default: 2

    --no-<attack strategy id>: Defines the attack strategies that may be ignored. It can be used multiple times to ignore each attack strategy

	Tip: Start with `--coverage-mode branch` and `--chain-length 2`(default) for a fast, high-value initial run
```

## Need Help?

If you encounter any issues or have questions, feel free to reach out:

**Email:** [contact@olympix.ai](mailto:contact@olympix.ai)

Happy fuzzing! 🎉