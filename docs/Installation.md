# Installation Guide

Welcome to the Olympix installation guide! Get started by installing the CLI and the VSCode extension to access all of Olympix’s powerful features. This guide covers the full process—from downloading the CLI binaries to authenticating your account.

---

## CLI Installation

### Option 1: Download the Olympix CLI from the CLI webpage

Visit the [Olympix CLI webpage](https://olympix-download.s3.amazonaws.com/cli/cli_doc.html) and scroll down to the **Download** section. Here, you’ll find precompiled binaries for various platforms, including macOS, Linux, and Windows (both x64 and ARM architectures).

### Option 2: Get it directly from the terminal

For example, to install on macOS (ARM64), run the following commands in your terminal:
!!! note 
    The following versions are available: (osx-arm64, osx-x64, win-x64, win-arm64, linux-x64, linux-arm64)

=== "osx-arm64"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.9.59/osx-arm64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```

=== "osx-x64"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.9.59/osx-x64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```

=== "win-arm64"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.9.59/win-arm64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```

=== "win-x64"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.9.59/win-x64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```

=== "linux-arm64"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.9.59/linux-arm64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```

=== "linux-x64"
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.9.59/linux-x64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```


!!! tip "Setting Permissions on Unix-like Systems"
    On macOS and Linux, ensure you grant execution permissions to the binary using `chmod +x`. If you receive a warning that the binary is from an unidentified developer, do the following:
    - Open **System Preferences** → **Security & Privacy**.
    - Click the **General** tab.
    - Select **Open Anyway** next to the warning message.

!!! tip "Setting Permissions on Windows"
    For Windows users, download the appropriate binary from the download page and follow these steps:
    - Download the `.exe` binary matching your Windows architecture.
    - Run the binary from the command prompt.
    - If needed, set the executable permissions through file properties.

---

## Authentication

After downloading and setting up the CLI, authenticate your account by following these steps:

1. **Run the login command:**  
   Execute `./olympix login -e your_email@domain.com` in your terminal.
   
2. **Enter the one-time code:**  
   You will receive a one-time code on your email. Enter it in the terminal prompt to complete authentication.
   
3. **Capture your API token:**  
   Once authenticated, your Olympix API token is displayed. Save it securely as it is required for integration with other services, such as GitHub Actions. (This token is also automatically stored in `~/.opix/config.json` )

!!! info "Need to Register Additional Emails?"
    If you need to register more email addresses for your organization, please email [contact@olympix.ai](mailto:contact@olympix.ai).

---

## VSCode Extension

Our extension is available in the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Olympixai.olympix). Install it to integrate Olympix features directly into your development environment.

---

## Additional Resources

- **Olympix CLI Documentation:** Visit the [CLI documentation page](./CLI/index.md) for complete command reference and troubleshooting tips.
- **YouTube Tutorial:** For a video walkthrough of the setup and usage, watch our [YouTube tutorial](https://youtu.be/x7Apoq2PgT0).

If you encounter any issues or have questions, feel free to reach out to our support team at [contact@olympix.ai](mailto:contact@olympix.ai).