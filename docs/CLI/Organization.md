# Organization Management

Manage your Olympix organization, users, and seats through the CLI.

---

## Overview

Organization admins can:
- View seat usage and availability
- Invite new team members
- Remove users from the organization
- Promote or demote organization admins
- Configure SSO authentication

---

## Prerequisites

- **Premium account** - Contact our Customer Success team at [contact@olympix.ai](mailto:contact@olympix.ai)
- **Organization admin role** - The first user in an organization is automatically an admin

---

## Commands

### View Seat Usage

Check your organization's seat allocation and usage:

```bash
olympix org-seats
```

**Output:**
```
Organization Seat Usage
-----------------------
Used Seats: 5
Max Seats: 10
Available Seats: 5
```

---

### List Organization Users

View all users in your organization (admin only):

```bash
olympix org-list-users
```

**Output:**
```
Organization Users
------------------
Email                      Name          Admin    User ID
john@company.com           john          Yes      a1b2c3d4-...
jane@company.com           jane          No       e5f6g7h8-...
```

---

### Invite a User

Send a welcome email to a new team member (admin only):

```bash
olympix org-invite-user -e new.user@company.com
```

**Options:**
| Option | Description |
|--------|-------------|
| `-e, --email` | Email address of the user to invite |

**What happens:**
1. User receives a **welcome email** with:
   - CLI installation instructions
   - Documentation links
   - Login command (either `olympix login -e` or `olympix login-sso` depending on your org setup)
2. User downloads the Olympix CLI
3. User logs in with the command provided in the email
4. User is **automatically added** to your organization during login

**Notes:**
- No manual invitation acceptance needed - users are auto-linked when they log in
- If no seats are available, users are linked to the org but **cannot use premium features** until seats become available
- The invitation email is informational - users could also self-enroll by downloading the CLI and logging in directly

---

### Remove a User

Remove a user from your organization (admin only):

```bash
olympix org-remove-user -u <user-id>
```

**Options:**
| Option | Description |
|--------|-------------|
| `-u, --user-id` | UUID of the user to remove (get from `org-list-users`) |

**Notes:**
- Cannot remove the last organization admin
- Removed users lose access to premium features
- User data is preserved but organization link is removed

---

### Set Organization Admin

Promote or demote a user to/from organization admin (admin only):

```bash
# Promote to admin
olympix org-set-admin -u <user-id> --grant

# Demote from admin
olympix org-set-admin -u <user-id> --revoke
```

**Options:**
| Option | Description |
|--------|-------------|
| `-u, --user-id` | UUID of the user |
| `--grant` | Promote user to admin |
| `--revoke` | Demote user from admin |

**Notes:**
- Cannot demote the last admin
- Admins can manage users and configure SSO

---

## SSO Configuration

### View SSO Configuration

Check your current SSO settings:

```bash
olympix show-sso
```

**Output when enabled:**
```
SSO Configuration
Organization: Acme Corp

Status: ✓ Enabled

SSO Provider: okta
Email Domain: acme-corp.com
JWT Expiration: 24 hours

Okta Configuration:
Okta Domain: acme-corp.okta.com
Client ID: 0oa1234567abcdefg

Management:
  • Update settings: olympix configure-sso
  • Disable SSO: olympix disable-sso
```

**Output when disabled (but previously configured):**
```
SSO Configuration
Organization: Acme Corp

Status: Disabled

SSO Provider: okta
Email Domain: acme-corp.com
JWT Expiration: 24 hours

Okta Configuration:
Okta Domain: acme-corp.okta.com
Client ID: 0oa1234567abcdefg

Management:
  • Re-enable SSO: olympix enable-sso
```

### Configure SSO

Configure Single Sign-On for your organization:

```bash
olympix configure-sso
```

See the [SSO Setup Guide](./SSO.md) for detailed instructions.

### Enable SSO

Re-enable SSO using your saved configuration (after it was disabled):

```bash
olympix enable-sso
```

**When to use:**
- You previously disabled SSO and want to turn it back on
- Your SSO configuration is already saved
- Quick way to re-enable without re-entering settings

**Notes:**
- Requires organization admin privileges
- Uses existing Okta domain, client ID, and email domain
- Users with matching email domains will immediately be required to use SSO
- To update settings while enabling, use `olympix configure-sso` instead

### Disable SSO

If SSO is causing issues or you need to switch back to email/code authentication:

```bash
olympix disable-sso
```

**When to use:**
- SSO provider is down or misconfigured
- Need to temporarily restore email/code login for all users
- Switching to a different SSO provider

**Notes:**
- Requires organization admin privileges
- All users will immediately be able to use `olympix login -e` again
- **Configuration is preserved** - your Okta settings, email domain, etc. are saved
- Re-enable quickly with `olympix configure-sso` (will use existing settings)
- Org admins can always use email/code login, even when SSO is enabled
- Check saved configuration anytime with `olympix show-sso`

---

## Authentication Requirements

Organization management commands require **interactive login** (JWT), not API tokens:

```bash
# Correct: Login first, then manage
olympix login -e admin@company.com
olympix org-list-users

# Incorrect: API tokens cannot manage organizations
export OLYMPIX_API_TOKEN="abc123..."
olympix org-list-users  # Error: Organization admin commands require interactive login
```

**Why?** Organization management requires verification of admin privileges, which API tokens don't provide.

---

## User Enrollment Flow

### Initial Setup

1. **Contact Customer Success** at [contact@olympix.ai](mailto:contact@olympix.ai)
2. Customer Success creates your organization with:
   - Initial admin account (the first user)
   - Email domain configuration (e.g., `company.com`)
   - Seat allocation for your team
3. The **first user** becomes the **Organization Admin** by default

### Adding Team Members

**Option 1: Admin Invitation (Recommended)**
```bash
olympix org-invite-user -e teammate@company.com
```
- User receives welcome email with download instructions
- User downloads CLI and logs in
- Automatically linked to organization based on email domain

**Option 2: Self-Service**
- User downloads CLI following the [Installation Guide](../Installation.md)
- User runs `olympix login -e user@company.com` or `olympix login-sso`
- Automatically added to organization if email domain matches

**How auto-linking works:**
- Your organization has an **email domain** (e.g., `company.com`) configured by Customer Success during org setup
- Any user with a matching email domain is **automatically added** to your organization when they log in
- Works for both SSO (`olympix login-sso`) and regular email/code login (`olympix login -e`)
- Existing standalone users with matching domain are automatically linked to your org when they next log in
- New users are auto-linked during their first login
- Users are linked to the organization regardless of seat availability, but **need an available seat** to use premium features

---

## Troubleshooting

### "Organization admin privileges required"

You're not an admin for your organization. Contact your org admin or [contact@olympix.ai](mailto:contact@olympix.ai).

### "Organization admin commands require interactive login"

You're using an API token instead of an interactive session:

```bash
# Unset API token
unset OLYMPIX_API_TOKEN

# Login interactively
olympix login -e your@email.com
```

### "Cannot remove the last admin"

Every organization must have at least one admin. Promote another user to admin first:

```bash
olympix org-set-admin -u <other-user-id> --grant
olympix org-remove-user -u <your-user-id>
```

### "Seat limit exceeded"

Your organization has reached its maximum seats. Users will be added to the organization but **cannot use premium features** until:
- An existing user is removed (freeing up a seat), or
- You contact [contact@olympix.ai](mailto:contact@olympix.ai) to purchase additional seats

Use `olympix org-seats` to check current seat usage and `olympix org-list-users` to see all organization members.

---

## Related Documentation

- **[SSO Setup](./SSO.md)** - Configure Okta Single Sign-On
- **[CLI Overview](./index.md)** - All CLI commands and options
- **[Installation](../Installation.md)** - Install the Olympix CLI

---

## Support

For organization management assistance:
- Email: [contact@olympix.ai](mailto:contact@olympix.ai)
- Include your organization name and admin email
