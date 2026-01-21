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

Invite a new team member to your organization (admin only):

```bash
olympix org-invite-user -e new.user@company.com
```

**Options:**
| Option | Description |
|--------|-------------|
| `-e, --email` | Email address of the user to invite |

**Notes:**
- Invitations expire after 7 days
- Invited users receive an email with instructions
- Users are automatically linked to your organization upon accepting

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

Configure Single Sign-On for your organization:

```bash
olympix configure-sso
```

See the [SSO Setup Guide](./SSO.md) for detailed instructions.

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
2. Customer Success creates your organization and initial admin account
3. The **first user** becomes the **Organization Admin** by default

### Adding Team Members

**Option 1: Admin Invitation**
```bash
olympix org-invite-user -e teammate@company.com
```
- User receives email invitation
- Accepts invitation and creates account
- Automatically linked to organization

**Option 2: SSO Self-Enrollment** (if SSO is configured)
1. User visits [app.olympixdevsectools.com](https://app.olympixdevsectools.com)
2. Clicks "Sign in with SSO"
3. Authenticates with corporate credentials
4. Account automatically created and linked

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

Your organization has reached its maximum seats. Contact [contact@olympix.ai](mailto:contact@olympix.ai) to upgrade.

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
