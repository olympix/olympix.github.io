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

- **Premium account** - Contact our sales team at [contact@olympix.ai](mailto:contact@olympix.ai) to upgrade
- **Okta administrator access** for your organization
- **Organization Admin role** in Olympix (first user is automatically org admin)

---

## User Enrollment

### Account Setup by Sales Team

1. Contact [contact@olympix.ai](mailto:contact@olympix.ai) to set up your premium account
2. Sales will create your organization and assign seats
3. The **first user** becomes the **Organization Admin** by default

### Organization Admin Capabilities

As an org admin, you can:
- Configure SSO for your organization
- Invite team members
- Manage seats and user access
- Promote other users to admin

### Self-Enrollment for Team Members

Once SSO is configured, team members can self-enroll:

1. Visit [app.olympixdevsectools.com](https://app.olympixdevsectools.com)
2. Click **Sign in with SSO**
3. Authenticate with your corporate Okta credentials
4. Account is automatically created and linked to your organization

> **Note**: Users must be assigned to the Olympix app in Okta to self-enroll.

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

As an **Organization Admin**, configure SSO using the CLI:

```bash
olympix configure-sso
```

The command will automatically detect your organization and prompt you for:

| Prompt | Example Value |
|--------|---------------|
| Enable SSO? | `y` |
| SSO Provider | `okta` (press Enter for default) |
| Okta Domain | `your-company.okta.com` |
| Okta Client ID | `0oa1234567abcdefg` |
| Okta Issuer | Press Enter for default |
| Okta Audience | Press Enter for default |
| Email Domain | `your-company.com` |
| JWT Expiration Hours | `24` (default, range: 1-720) |

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
1. Your account is **premium** (contact sales if not)
2. Okta configuration was submitted to Olympix
3. Contact [contact@olympix.ai](mailto:contact@olympix.ai) if issues persist

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

## Security Best Practices

1. **Use groups for access control** - Assign Olympix to an Okta group rather than individual users
2. **Enable MFA** - Configure multi-factor authentication in your Okta policies
3. **Review access regularly** - Audit who has access to the Olympix application

---

## Support

For SSO configuration assistance:
- Email: [contact@olympix.ai](mailto:contact@olympix.ai)
- Include your organization name and Okta domain

For Okta-specific questions:
- [Okta Developer Documentation](https://developer.okta.com/docs/)
- [Device Authorization Flow Guide](https://developer.okta.com/docs/guides/device-authorization-grant/)
