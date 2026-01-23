# Single Sign-On (SSO) Setup

Enable Okta SSO for your organization to authenticate with Olympix CLI using your corporate identity provider.

---

## Overview

Olympix supports **Okta SSO** authentication, allowing your team to:
- Log in using corporate credentials
- Enforce security policies through your identity provider
- Centrally manage access to Olympix tools

---

## Prerequisites

- **Premium account** - Contact our Customer Success team at [contact@olympix.ai](mailto:contact@olympix.ai) to upgrade
- **Okta administrator access** for your organization
- **Organization Admin role** in Olympix (first user is automatically org admin)

---

## User Enrollment

### Account Setup

1. Contact our **Customer Success team** at [contact@olympix.ai](mailto:contact@olympix.ai) to set up your premium account
2. Customer Success will create your organization and configure:
   - Email domain for auto-linking (e.g., `company.com`)
   - Initial seat allocation
   - First admin user account
3. The **first user** becomes the **Organization Admin** by default

### Organization Admin Capabilities

As an org admin, you can:
- Configure SSO for your organization
- Invite team members via `olympix org-invite-user`
- Manage seats and user access
- Promote other users to admin via `olympix org-set-admin`

See the [Organization Management Guide](./Organization.md) for detailed instructions on user management.

### Team Member Enrollment

Team members can join your organization in two ways:

**Method 1: Admin Invitation (Recommended)**
```bash
# Admin sends invitation
olympix org-invite-user -e teammate@company.com
```
- User receives a welcome email with setup instructions and the appropriate login command
- User downloads CLI and runs the login command from the email
- User is automatically added to the organization

**Method 2: Self-Service Login**
```bash
# For SSO-enabled organizations
olympix login-sso -e user@company.com

# For organizations using email/code authentication
olympix login -e user@company.com
```

**What happens during login:**
1. User downloads Olympix CLI following the [Installation Guide](../Installation.md)
2. User logs in with their email using the appropriate method
3. System detects email domain matches your organization (configured by Customer Success)
4. User is **automatically added** to your organization
5. If seats are available, user gains immediate access to premium features
6. If seats are full, user is linked to the org but must wait for seat availability

> **Note**: For SSO login, users must be assigned to the Olympix app in Okta.

---

## Step 1: Create Okta Application

1. **Log in to Okta Admin Console**
   - Navigate to: `Applications` → `Applications`

2. **Create New App Integration**
   - Click: `Create App Integration`
   - **Sign-in method**: Select `OIDC - OpenID Connect`
   - **Application type**: Select `Native Application`
   - Click: `Next`

---

## Step 2: Configure Application Settings

### General Settings

| Field | Value |
|-------|-------|
| **App integration name** | `Olympix` |
| **Proof of possession** | Leave unchecked |

### Grant Type

Select the following grant types:

| Grant Type | Status | Notes |
|------------|--------|-------|
| **Authorization Code** | ☑ Check | Required |
| **Refresh Token** | ☐ Leave unchecked | Olympix handles refresh internally |
| **Device Authorization** | ☑ **Check** | **Required for CLI authentication** |

> ⚠️ **Important**: You must enable **Device Authorization** for the Olympix CLI to work.

### Sign-in Redirect URIs

Add the following URI:

```
com.okta.{your-okta-subdomain}:/callback
```

### Sign-out Redirect URIs (Optional)

```
com.okta.{your-okta-subdomain}:/
```

### Controlled Access

Choose who in your organization can use Olympix:

| Option | Description |
|--------|-------------|
| **Allow everyone in your organization** | Recommended for most teams |
| **Limit access to selected groups** | Restrict to specific Okta groups |

Click **Save** to create the application.

---

## Step 3: Copy Your Configuration

After saving, you'll see your application's settings. Copy these values:

| Setting | Where to Find |
|---------|---------------|
| **Client ID** | On the application's General tab |
| **Okta Domain** | Your Okta URL (e.g., `your-company.okta.com`) |

Example:
```
Client ID: 0oa1234567abcdefg
Okta Domain: acme-corp.okta.com
```

---

## Step 4: Configure SSO in Olympix

As an **Organization Admin**, configure your Okta SSO provider using the CLI:

```bash
olympix configure-sso
```

**View current configuration** at any time:
```bash
olympix show-sso
```

The command will prompt you for:

| Prompt | Example Value | Description |
|--------|---------------|-------------|
| Okta Domain | `your-company.okta.com` | Your Okta organization domain |
| Okta Client ID | `0oa1234567abcdefg` | Client ID from Step 3 |
| Email Domain | `your-company.com` | Your organization's email domain (pre-configured by Customer Success) |

Example:
```
Configure SSO for your organization
Organization: 5c15e765-571b-4a1a-8ef2-1b768ada8485

Okta Domain (e.g., your-domain.okta.com): acme-corp.okta.com
Okta Client ID: 0oa1234567abcdefg
Email Domain (e.g., company.com): acme-corp.com

Configuring SSO... Done!
✓ SSO configured successfully!
Okta Domain: acme-corp.okta.com
Client ID: 0oa1234567abcdefg
Email Domain: acme-corp.com
```

> **Note**: The email domain was set by Customer Success when your organization was created. Configuring SSO will enforce SSO login for all users with matching email addresses (e.g., `@acme-corp.com`), while org admins can still use `olympix login -e` as a backup.

> **Note**: You must be logged in as an org admin to configure SSO.

---

## Step 5: Test SSO Login

Once Olympix confirms your SSO is configured:

```bash
olympix login-sso
```

Expected flow:
1. CLI displays a verification URL and code
2. Open the URL in your browser
3. Authenticate with your Okta credentials
4. CLI automatically completes login

Example output:
```
Initiating Okta SSO login... Done!
Please authenticate in your browser:
  https://your-company.okta.com/activate?user_code=ABCD-EFGH

Waiting for authentication... Success!
✓ SSO authentication successful!
```

---

## Assigning Users (Optional)

To control which users can access Olympix:

1. In Okta Admin Console, go to your Olympix application
2. Click the **Assignments** tab
3. Assign users or groups

---

## Troubleshooting

### "SSO is not configured for your organization"

Your organization's SSO configuration hasn't been activated yet. Ensure:
1. Your account is **premium** (contact Customer Success if not)
2. Okta configuration was completed via `olympix configure-sso`
3. The **email domain** matches your login email (e.g., `company.com` for `user@company.com`)
4. Contact [contact@olympix.ai](mailto:contact@olympix.ai) if issues persist

### "You must be an organization admin"

Only org admins can configure SSO. The first user in an organization is automatically an admin. Contact your org admin or [contact@olympix.ai](mailto:contact@olympix.ai) for assistance.

### "Failed to initiate device authorization"

Verify that:
- **Device Authorization** grant type is enabled in your Okta app
- Your Client ID was correctly provided to Olympix

### "Authorization pending" timeout

The login code expires after 15 minutes. Run `olympix login-sso` again to get a new code.

### Users can't access Olympix

Check the **Assignments** tab in your Okta application to ensure users are assigned.

---

## Emergency Access for Org Admins

If SSO is misconfigured or Okta is unavailable, **org admins can still log in** using the standard email/code flow:

```bash
olympix login -e admin@your-company.com
```

This allows org admins to:
- Fix SSO configuration issues with `olympix configure-sso`
- Disable SSO temporarily with `olympix disable-sso`
- Maintain access during Okta outages

### Disabling SSO

To disable SSO and restore email/code login for all users:

```bash
# 1. Login as org admin using emergency access
olympix login -e admin@your-company.com

# 2. Disable SSO (preserves configuration)
olympix disable-sso

# 3. Check that SSO is disabled but config is saved
olympix show-sso
```

**What happens when you disable SSO:**
- All users can immediately use `olympix login -e` again
- Your configuration is **preserved** (Okta domain, client ID, email domain, etc.)
- You can re-enable SSO at any time without re-entering settings

**To re-enable SSO after disabling:**
```bash
# Quick re-enable with existing settings
olympix enable-sso

# Or reconfigure/update settings
olympix configure-sso
```

> **Note**: Regular users cannot bypass SSO. Only org admins have emergency access.

---

## Security Best Practices

1. **Use groups for access control** - Assign Olympix to an Okta group rather than individual users
2. **Enable MFA** - Configure multi-factor authentication in your Okta policies
3. **Review access regularly** - Audit who has access to the Olympix application
4. **Limit org admins** - Only essential personnel should have org admin status

---

## SSO Commands Reference

| Command | Description |
|---------|-------------|
| `olympix login-sso` | Log in using Okta SSO |
| `olympix login-sso -e user@company.com` | Log in with email hint for organization detection |
| `olympix configure-sso` | Configure SSO settings (admin only) |
| `olympix show-sso` | View current SSO configuration (admin only) |
| `olympix enable-sso` | Enable SSO with saved configuration (admin only) |
| `olympix disable-sso` | Disable SSO for organization (admin only) |

---

## Related Documentation

- **[Organization Management](./Organization.md)** - Manage users, seats, and admin roles
- **[CLI Overview](./index.md)** - All CLI commands and options
- **[Installation](../Installation.md)** - Install the Olympix CLI

---

## Support

For SSO configuration assistance:
- Email: [contact@olympix.ai](mailto:contact@olympix.ai)
- Include your organization name and Okta domain

For Okta-specific questions:
- [Okta Developer Documentation](https://developer.okta.com/docs/)
- [Device Authorization Flow Guide](https://developer.okta.com/docs/guides/device-authorization-grant/)
