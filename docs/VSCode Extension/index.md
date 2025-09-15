# VSCode Extension

Our extension is available in the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Olympixai.olympix). Install it to integrate Olympix features directly into your development environment.

---

## Features

The Olympix VSCode extension brings powerful security analysis right into your editor, helping you write more secure Solidity code.

- **Real-time Vulnerability Scanning:** Get immediate feedback on potential security issues as you type.
- **Automatic Quick Fixes:** Apply suggested code changes to fix common vulnerabilities with a single click.

---

## 💡 Quick Fixes

The **Olympix Quick Fix** feature is designed to accelerate your development workflow by providing instant, actionable solutions to detected vulnerabilities. When our analyzer identifies a potential issue, it may also suggest a code snippet that can resolve it.

### How It Works

1.  **Detection:** When a vulnerability is found, it will be highlighted in the "Problems" tab of VS Code, and a squiggle will appear under the affected code.
2.  **Action:** A lightbulb icon 💡 will appear next to the highlighted line. Click the icon or use the keyboard shortcut (`Ctrl`+`.` on Windows/Linux, `Cmd`+`.` on macOS).
3.  **Apply:** Select the "Apply Olympix Quick Fix" option from the context menu to automatically insert the suggested code change.

### Example: Locked Ether Vulnerability

A **"locked ether"** vulnerability occurs when a contract can receive Ether but has no function to withdraw it. Our Quick Fix feature makes resolving this simple.

1.  **Vulnerability Detected:** The extension highlights the contract definition, warning that it can receive Ether but has no way to send it out, potentially locking funds permanently.

    

2.  **Apply the Quick Fix:** Clicking the lightbulb icon presents the option to apply the fix.

    

3.  **Result:** The extension automatically inserts a generic `withdraw` function into the contract. This new function contains a placeholder (`owner`) that you should replace with the correct address for withdrawal authorization.

    

This feature helps you fix vulnerabilities quickly and learn secure coding patterns without leaving your editor.

### Current detectors with Quick Fixes:

- ArbitrarySendEtherDetector.cs
- AnyTxOriginDetector.cs
- ArbitraryDelegatecallDetector.cs
- ArrayParameterLocationDetector.cs
- DefaultVisibilityDetector.cs
- EnumConversionOutOfRangeDetector.cs
- EtherBalanceCheckStrictEqualityDetector.cs
- LockedEtherDetector.cs
- LowLevelCallParamsVerifiedDetector.cs
- NoParameterValidationInConstructorDetector.cs
- PossibleDivisionByZeroDetector.cs
- RequiredTxOriginDetector.cs
- UnboundedPragmaDetector.cs
- UncheckedLowLevelDetector.cs
- UncheckedSendDetector.cs
- UncheckedTokenTransferDetector.cs
- UninitializedLocalStorageDetector.cs
