# Starlight Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current MkDocs Material site at `https://olympix.github.io/` with an Astro + Starlight site, deployed to GitHub Pages via `actions/deploy-pages@v4`.

**Architecture:** Fresh Astro project at the repo root with Starlight as a content collection. All 16 source Markdown pages migrate to `src/content/docs/`, with 4 becoming `.mdx` for component use (`<Tabs>`, `<CardGrid>`, `<LinkCard>`, `<Steps>`). 30 Material admonitions across 11 files convert to Starlight asides (`:::note`, `:::tip`, `:::caution`). MkDocs artifacts (`mkdocs.yml`, `overrides/`, `mkdocs_serve.sh`, old `ci.yml`) are deleted in the same PR.

**Tech Stack:** Astro 4+, Starlight (latest), Node 20, GitHub Actions (`actions/deploy-pages@v4`), Pagefind (built-in Starlight search).

**Reference:** [Migration design spec](../specs/2026-05-11-starlight-migration-design.md)

**Note on testing:** This is a docs migration with no application code, so "tests" mean: `npm run build` exits zero and `npm run dev` renders the page correctly with working internal links. Each task ends with a verification step appropriate to its scope.

---

## Task 1: Scaffold Astro + Starlight project at repo root

**Files:**
- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `astro.config.mjs`, `src/content.config.ts`, `.gitignore` (modify)
- Create: `src/content/docs/index.md` (placeholder, replaced in Task 5)

**Context:** The repo currently has no `package.json` — it's a Python/MkDocs project. We're adding Node tooling. Don't run the official scaffolder (`npm create astro`) interactively; instead create files directly so the steps are reproducible.

- [ ] **Step 1: Initialize package.json**

Create `package.json`:

```json
{
  "name": "olympix-docs",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/starlight": "^0.30.0",
    "astro": "^5.0.0",
    "sharp": "^0.33.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: Creates `node_modules/` and `package-lock.json`. No errors.

- [ ] **Step 3: Create tsconfig.json**

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create minimal astro.config.mjs**

This is a placeholder — the full sidebar config comes in Task 2. We just need enough to boot the dev server.

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://olympix.github.io',
  integrations: [
    starlight({
      title: 'Olympix',
      logo: { src: './public/olymp-x-logo.png' },
    }),
  ],
});
```

- [ ] **Step 5: Create content collection schema**

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
```

- [ ] **Step 6: Create placeholder index page**

Create `src/content/docs/index.md`:

```md
---
title: Olympix
description: Placeholder — replaced in Task 5.
---

Migration in progress.
```

- [ ] **Step 7: Update .gitignore**

Read current `.gitignore` (only contains `.DS_Store` lines), then replace it with:

```
.DS_Store
**/.DS_Store

# Node / Astro
node_modules/
dist/
.astro/

# MkDocs leftovers (deleted in Task 12, ignored until then)
.cache/
```

- [ ] **Step 8: Verify dev server boots**

Run: `npm run dev`
Expected: Astro dev server starts on `http://localhost:4321/`. Open it in a browser — should see the Starlight skeleton with the placeholder "Olympix" page. No errors in terminal. Stop with Ctrl-C.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs src/content.config.ts src/content/docs/index.md .gitignore
git commit -m "feat: scaffold Astro + Starlight project"
```

---

## Task 2: Configure astro.config.mjs sidebar and full settings

**Files:**
- Modify: `astro.config.mjs`

**Context:** Replace the minimal config from Task 1 with the full sidebar definition. We use `autogenerate` for sub-sections so we don't have to hand-list every CLI page; for top-level pages we use explicit `link` entries.

- [ ] **Step 1: Replace astro.config.mjs**

Overwrite `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://olympix.github.io',
  integrations: [
    starlight({
      title: 'Olympix',
      logo: { src: './public/olymp-x-logo.png' },
      social: [],
      sidebar: [
        { label: 'Installation', link: '/installation/' },
        { label: 'Config Options', link: '/config-options/' },
        { label: 'Ignore Options', link: '/ignore-options/' },
        {
          label: 'CLI',
          autogenerate: { directory: 'cli' },
        },
        {
          label: 'GitHub Actions',
          autogenerate: { directory: 'github-actions' },
        },
        {
          label: 'VSCode Extension',
          autogenerate: { directory: 'vscode-extension' },
        },
      ],
    }),
  ],
});
```

- [ ] **Step 2: Verify dev server still boots**

Run: `npm run dev`
Expected: Server starts. Open `http://localhost:4321/`. The sidebar will show the entries above, but the linked pages won't exist yet — that's expected. The placeholder index page renders. No build-blocking errors. Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: configure Starlight sidebar"
```

---

## Task 3: Move logo asset to public/

**Files:**
- Create: `public/olymp-x-logo.png`
- Delete: `docs/assets/olymp-x-logo.png` (the parent `docs/` is fully removed in Task 12)

**Context:** Starlight serves files from `public/` at site root. The logo path in `astro.config.mjs` (`./public/olymp-x-logo.png`) already expects this location.

- [ ] **Step 1: Create public/ and move the logo**

```bash
mkdir -p public
git mv docs/assets/olymp-x-logo.png public/olymp-x-logo.png
```

- [ ] **Step 2: Verify the logo renders in dev**

Run: `npm run dev`
Open `http://localhost:4321/`. Check the top-left of the page — the Olympix logo should appear in the header. Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add public/olymp-x-logo.png docs/assets/olymp-x-logo.png
git commit -m "feat: move logo asset to public/"
```

---

## Task 4: Migrate root pages (config-options.md, ignore-options.md)

**Files:**
- Create: `src/content/docs/config-options.md`, `src/content/docs/ignore-options.md`
- Source: `docs/ConfigOptions.md`, `docs/IgnoreOptions.md` (deleted in Task 12)

**Context:** These are straight migrations: rename the file, lowercase + hyphenate, add Starlight frontmatter, strip the `# Title` H1 from the body, rewrite internal links, convert any admonitions.

**Admonitions to convert in these files:**
- `docs/ConfigOptions.md:97` — `!!! Warning Be extra-confident...` → `:::caution`
- `docs/IgnoreOptions.md:34` — `!!! note` → `:::note`
- `docs/IgnoreOptions.md:61` — `!!! info` → `:::note`
- `docs/IgnoreOptions.md:84` — `!!! Warning` → `:::caution`

**Internal-link rewrites in these files:** scan for `](./`, `](../`, or `](Path/file.md)` patterns and apply the spec's link rules.

- [ ] **Step 1: Create config-options.md**

Read `docs/ConfigOptions.md` first. Then create `src/content/docs/config-options.md`:

1. Strip the `# Config Options` (or whatever the H1 is) line from the top.
2. Prepend frontmatter:
   ```
   ---
   title: Config Options
   description: Configure Olympix CLI behavior via the .opix config file.
   ---
   ```
3. Convert the line `!!! Warning Be extra-confident...` and its body to:
   ```
   :::caution
   Be extra-confident before disabling any vulnerabilities, as this could allow bugs to silently pass into production—bugs that might not even exist yet. Ignoring vulnerabilities should only be done after a thorough review to ensure that it does not introduce security risks in the future.
   :::
   ```
   (The original is on a single line with the directive and content concatenated; preserve the meaning.)
4. Rewrite any `](./Path/file.md)` style links to absolute Starlight paths (e.g. `](/cli/analysis/)`).

- [ ] **Step 2: Create ignore-options.md**

Read `docs/IgnoreOptions.md` first. Then create `src/content/docs/ignore-options.md`:

1. Strip the H1.
2. Add frontmatter:
   ```
   ---
   title: Ignore Options
   description: Suppress specific vulnerability findings using .opixignore files.
   ---
   ```
3. Convert each admonition. Material indents the body 4 spaces; Starlight uses `:::` close delimiters with no body indent. For example:
   ```
   !!! note
       Some note text here.
       Another paragraph.
   ```
   becomes:
   ```
   :::note
   Some note text here.
   Another paragraph.
   :::
   ```
   Apply this transformation to each `!!! note`, `!!! info`, `!!! Warning` (note: `info` maps to `note`; `Warning` maps to `caution`).
4. Rewrite internal links per the spec.

- [ ] **Step 3: Verify both pages render**

Run: `npm run dev`. Visit `http://localhost:4321/config-options/` and `http://localhost:4321/ignore-options/`. Both should render with:
- Title from frontmatter shown as page H1.
- Asides rendered as colored callout boxes.
- Internal links present (some may 404 because target pages don't exist yet — note any that do not have a target page yet to be migrated, but if they point to other root pages they should resolve).

Stop with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/config-options.md src/content/docs/ignore-options.md
git commit -m "feat: migrate root config and ignore pages"
```

---

## Task 5: Migrate landing page (index.mdx with CardGrid)

**Files:**
- Modify: `src/content/docs/index.md` → renamed to `src/content/docs/index.mdx`
- Source: `docs/index.md` (deleted in Task 12)

**Context:** This replaces the placeholder from Task 1. The landing page becomes `.mdx` so it can use `<CardGrid>` and `<LinkCard>`. The "Welcome" prose stays; the bulleted "Contents" list becomes a card grid.

- [ ] **Step 1: Rename the placeholder to .mdx**

```bash
git mv src/content/docs/index.md src/content/docs/index.mdx
```

- [ ] **Step 2: Replace index.mdx content**

Read `docs/index.md` first to confirm the exact welcome wording. Then create `src/content/docs/index.mdx`:

```mdx
---
title: Olympix
description: Official documentation for the Olympix CLI, test generation tools, and integrated security features.
---

import { CardGrid, LinkCard } from '@astrojs/starlight/components';

Welcome to the official Olympix documentation! Here you'll find everything you need to get started with our CLI, test generation tools, and integrated security features. Whether you're setting up your environment, scanning for vulnerabilities, or automating test generation, our documentation provides clear instructions and detailed examples.

**Visit our Website:** Explore more about Olympix and our solutions at [olympix.ai](https://olympix.ai).

**Detector Documentation:** For in-depth information on our vulnerability detectors, check out the [Detector Documentation](https://detectors.olympixdevsectools.com/).

## Contents

<CardGrid>
  <LinkCard
    title="Installation"
    href="/installation/"
    description="Get started with downloading and installing the Olympix CLI and VSCode extension."
  />
  <LinkCard
    title="CLI"
    href="/cli/"
    description="Learn about the Olympix CLI commands, options, and usage examples."
  />
  <LinkCard
    title="GitHub Actions"
    href="/github-actions/integrated-security/"
    description="GitHub Actions integrations provided by Olympix."
  />
  <LinkCard
    title="VSCode Extension"
    href="/vscode-extension/"
    description="Integrated features in your editor — real-time scanning and quick fixes."
  />
</CardGrid>

---

Happy exploring, and feel free to reach out to us at [contact@olympix.ai](mailto:contact@olympix.ai) if you have any questions or need support.
```

- [ ] **Step 3: Verify landing page renders**

Run: `npm run dev`. Visit `http://localhost:4321/`. Should show:
- "Olympix" title
- Welcome prose
- A 2x2 grid of cards (Installation, CLI, GitHub Actions, VSCode Extension)
- Cards are clickable (some destinations may 404 until later tasks)

Stop with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/index.mdx
git commit -m "feat: migrate landing page with CardGrid"
```

---

## Task 6: Migrate Installation page (Tabs + admonitions)

**Files:**
- Create: `src/content/docs/installation.mdx`
- Source: `docs/Installation.md` (deleted in Task 12)

**Context:** Most complex single-file migration: 6 OS-specific tab blocks become a `<Tabs>` component, plus 4 admonitions to convert.

**Admonitions in this file:**
- `!!! note` (line 9, no title) → `:::note`
- `!!! tip "Setting Permissions on Unix-like Systems"` → `:::tip[Setting Permissions on Unix-like Systems]`
- `!!! tip "Setting Permissions on Windows"` → `:::tip[Setting Permissions on Windows]`
- `!!! info "Adding Team Members"` → `:::note[Adding Team Members]`

- [ ] **Step 1: Create installation.mdx**

Read `docs/Installation.md` first to copy the exact bash commands inside each tab. Then create `src/content/docs/installation.mdx`:

```mdx
---
title: Installation Guide
description: Install the Olympix CLI and VSCode extension and authenticate your account.
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

Welcome to the Olympix installation guide! Get started by installing the CLI and the VSCode extension to access all of Olympix's powerful features. This guide covers the full process—from downloading the CLI binaries to authenticating your account.

## CLI Installation

:::note
The following versions are available: osx-arm64, osx-x64, win-x64, win-arm64, linux-x64, linux-arm64.
:::

<Tabs>
  <TabItem label="osx-arm64">
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.11.72/osx-arm64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```
  </TabItem>
  <TabItem label="osx-x64">
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.11.72/osx-x64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```
  </TabItem>
  <TabItem label="win-arm64">
    ```bash
    curl.exe -o olympix.exe https://olympix-download.s3.amazonaws.com/cli/v0.11.72/win-arm64/olympix.exe
    ./olympix.exe login -e user@olympix.ai
    ```
  </TabItem>
  <TabItem label="win-x64">
    ```bash
    curl.exe -o olympix.exe https://olympix-download.s3.amazonaws.com/cli/v0.11.72/win-x64/olympix.exe
    ./olympix.exe login -e user@olympix.ai
    ```
  </TabItem>
  <TabItem label="linux-arm64">
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.11.72/linux-arm64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```
  </TabItem>
  <TabItem label="linux-x64">
    ```bash
    curl -o olympix https://olympix-download.s3.amazonaws.com/cli/v0.11.72/linux-x64/olympix
    chmod +x olympix
    ./olympix login -e user@olympix.ai
    ```
  </TabItem>
</Tabs>

:::tip[Setting Permissions on Unix-like Systems]
On macOS and Linux, ensure you grant execution permissions to the binary using `chmod +x`. If you receive a warning that the binary is from an unidentified developer, do the following:
- Open **System Preferences** → **Security & Privacy**.
- Click the **General** tab.
- Select **Open Anyway** next to the warning message.
:::

:::tip[Setting Permissions on Windows]
For Windows users, download the appropriate binary from the download page and follow these steps:
- Download the `.exe` binary matching your Windows architecture.
- Run the binary from the command prompt.
- If needed, set the executable permissions through file properties.
:::

## Authentication

After downloading and setting up the CLI, authenticate your account by following these steps:

1. **Run the login command:** Execute `./olympix login -e your_email@domain.com` in your terminal.
2. **Enter the one-time code:** You will receive a one-time code on your email. Enter it in the terminal prompt to complete authentication.
3. **Capture your API token:** Once authenticated, your Olympix API token is displayed. Save it securely as it is required for integration with other services, such as GitHub Actions. (This token is also automatically stored in `~/.opix/config.json`.)

:::note[Adding Team Members]
**For organization users:** Organization admins can invite team members using `olympix org-invite-user -e user@company.com`. See the [Organization Management Guide](/cli/organization/) for details.

**For standalone accounts:** If you need to register additional standalone email addresses (not part of an organization), email [contact@olympix.ai](mailto:contact@olympix.ai).
:::

## VSCode Extension

Our extension is available in the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Olympixai.olympix). Install it to integrate Olympix features directly into your development environment.

## Additional Resources

- **Olympix CLI Documentation:** Visit the [CLI documentation page](/cli/) for complete command reference and troubleshooting tips.
- **YouTube Tutorial:** For a video walkthrough of the setup and usage, watch our [YouTube tutorial](https://youtu.be/x7Apoq2PgT0).

If you encounter any issues or have questions, feel free to reach out to our support team at [contact@olympix.ai](mailto:contact@olympix.ai).
```

- [ ] **Step 2: Verify Installation page renders**

Run: `npm run dev`. Visit `http://localhost:4321/installation/`. Verify:
- The 6-tab `<Tabs>` block renders with clickable tabs.
- Each tab shows its bash code block.
- All 4 asides render as colored callouts (1 note, 2 tip, 1 note).
- Internal link to `/cli/organization/` is present (will 404 until Task 8).

Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/installation.mdx
git commit -m "feat: migrate installation page with Tabs and asides"
```

---

## Task 7: Migrate CLI section index (LinkCard)

**Files:**
- Create: `src/content/docs/cli/index.mdx`
- Source: `docs/CLI/index.md` (deleted in Task 12)

**Context:** This is the CLI landing page. Convert the bottom "Helpful Links" bullet list to `<CardGrid>` of `<LinkCard>`. The rest of the page (CLI Commands Overview, Analysis Options, Unit Tests Generation Options, Mutation Tests Generation Options, BugPoCer Options, Usage Examples) is plain Markdown — copy it verbatim, just strip the H1 and rewrite internal links.

No admonitions in this file.

- [ ] **Step 1: Create cli/index.mdx**

```bash
mkdir -p src/content/docs/cli
```

Read `docs/CLI/index.md` first. Then create `src/content/docs/cli/index.mdx`:

1. Add frontmatter:
   ```
   ---
   title: Getting Started
   description: Quick start guide for the Olympix CLI — commands, options, and usage examples.
   ---
   import { CardGrid, LinkCard } from '@astrojs/starlight/components';
   ```
2. Strip the `# Getting Started` H1.
3. Copy the rest of the page verbatim through "Usage Examples" and the closing prose.
4. Replace the entire "Helpful Links" section (the bulleted list of 6 links at the bottom) with:
   ```mdx
   ## Helpful Links

   <CardGrid>
     <LinkCard title="Installation" href="/installation/" description="Install the CLI binaries and VSCode extension." />
     <LinkCard title="Unit Test Generation" href="/cli/unit-testing/" description="Generate unit tests for your smart contracts." />
     <LinkCard title="Mutation Tests Generation" href="/cli/mutation-testing/" description="Assess your unit test quality with mutation testing." />
     <LinkCard title="BugPoCer" href="/cli/bugpocer/" description="AI-powered vulnerability scanner with automated PoC generation." />
     <LinkCard title="SSO Setup" href="/cli/sso/" description="Configure Okta Single Sign-On for your organization." />
     <LinkCard title="Organization Management" href="/cli/organization/" description="Manage users, seats, and admin roles." />
   </CardGrid>
   ```
5. Keep the closing paragraph ("With these commands and options at your disposal...").

- [ ] **Step 2: Verify CLI index renders**

Run: `npm run dev`. Visit `http://localhost:4321/cli/`. Verify:
- Title "Getting Started" appears.
- Long content body renders.
- The Helpful Links section shows a card grid (6 cards) instead of bullets.
- Cards are clickable (most will 404 until Task 8).

Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/cli/index.mdx
git commit -m "feat: migrate CLI section index with LinkCards"
```

---

## Task 8: Migrate CLI content pages (6 files)

**Files:**
- Create: `src/content/docs/cli/analysis.md`, `bugpocer.md`, `mutation-testing.md`, `organization.md`, `sso.md`, `unit-testing.md`
- Source: `docs/CLI/Analysis.md`, `BugPoCer.md`, `Mutation Testing.md`, `Organization.md`, `SSO.md`, `Unit Testing.md` (deleted in Task 12)

**Context:** These are 6 content pages. Apply the universal conversion rules per file: strip H1, add frontmatter, rewrite internal links, convert admonitions, leave everything else alone.

**Admonitions per file:**

- `Analysis.md`: 2 admonitions (`!!! tip "Quick Start"`, `!!! info "Choosing a Reporting Strategy"`) → `:::tip[Quick Start]`, `:::note[Choosing a Reporting Strategy]`
- `BugPoCer.md`: 12 admonitions — convert each. Type mapping:
  - `info` → `note`
  - `tip` → `tip`
  - `warning` → `caution`
  - `note` → `note`
- `Mutation Testing.md`: 1 admonition (`!!! tip "Including env variables"`) → `:::tip[Including env variables]`
- `Organization.md`: 0 admonitions
- `SSO.md`: 0 admonitions
- `Unit Testing.md`: 6 admonitions — convert each per the type mapping above.

Suggested page titles (use these in frontmatter):

| Source | Title | Description |
|---|---|---|
| `Analysis.md` | `Analysis` | `Run static analysis on Solidity contracts with the Olympix CLI.` |
| `BugPoCer.md` | `BugPoCer` | `AI-powered vulnerability detection with automated PoC generation.` |
| `Mutation Testing.md` | `Mutation Testing` | `Generate mutation tests to assess unit test quality.` |
| `Organization.md` | `Organization Management` | `Manage users, seats, and admin roles for your organization.` |
| `SSO.md` | `SSO Setup` | `Configure Okta Single Sign-On for your organization.` |
| `Unit Testing.md` | `Unit Testing` | `Generate unit tests for Solidity contracts.` |

Adjust titles if the source H1 differs — match what the original page calls itself.

- [ ] **Step 1: Migrate cli/analysis.md**

Read `docs/CLI/Analysis.md`. Create `src/content/docs/cli/analysis.md`:
- Add frontmatter (title, description per table).
- Strip H1.
- Convert the 2 admonitions per the mapping above. Remember: dedent the 4-space-indented body and wrap with `:::` close delimiter.
- Rewrite internal links (e.g., `[Installation](../Installation.md)` → `[Installation](/installation/)`).

- [ ] **Step 2: Migrate cli/bugpocer.md**

Read `docs/CLI/BugPoCer.md`. Create `src/content/docs/cli/bugpocer.md`:
- Add frontmatter.
- Strip H1.
- Convert all 12 admonitions. Process them in order, keeping track of which type maps to which Starlight type.
- Rewrite internal links.

- [ ] **Step 3: Migrate cli/mutation-testing.md**

Read `docs/CLI/Mutation Testing.md`. Create `src/content/docs/cli/mutation-testing.md`:
- Add frontmatter.
- Strip H1.
- Convert the 1 admonition.
- Rewrite internal links.

- [ ] **Step 4: Migrate cli/organization.md**

Read `docs/CLI/Organization.md`. Create `src/content/docs/cli/organization.md`:
- Add frontmatter.
- Strip H1.
- No admonitions.
- Rewrite internal links.

- [ ] **Step 5: Migrate cli/sso.md**

Read `docs/CLI/SSO.md`. Create `src/content/docs/cli/sso.md`:
- Add frontmatter.
- Strip H1.
- No admonitions.
- Rewrite internal links.

- [ ] **Step 6: Migrate cli/unit-testing.md**

Read `docs/CLI/Unit Testing.md`. Create `src/content/docs/cli/unit-testing.md`:
- Add frontmatter.
- Strip H1.
- Convert all 6 admonitions.
- Rewrite internal links.

- [ ] **Step 7: Verify all CLI pages render**

Run: `npm run dev`. Visit each in turn:
- `http://localhost:4321/cli/analysis/`
- `http://localhost:4321/cli/bugpocer/`
- `http://localhost:4321/cli/mutation-testing/`
- `http://localhost:4321/cli/organization/`
- `http://localhost:4321/cli/sso/`
- `http://localhost:4321/cli/unit-testing/`

For each, verify: title renders, body content present, asides render correctly (count them — should match the per-file admonition count above), no MDX/JSX parsing errors in the terminal. Stop the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add src/content/docs/cli/
git commit -m "feat: migrate CLI content pages"
```

---

## Task 9: Migrate GitHub Actions section (4 files)

**Files:**
- Create: `src/content/docs/github-actions/bugpocer.md`, `integrated-security.md`, `mutation-test-generator.md`, `unit-test-generator.md`
- Source: `docs/Github Actions/bugpocer.md`, `integrated-security.md`, `mutation-test-generator.md`, `unit-test-generator.md` (deleted in Task 12)

**Context:** Four pages, all `.md`. Only one has an admonition.

**Admonitions per file:**
- `bugpocer.md`: 1 admonition (`!!! warning "Workflow file must live on the default branch"`) → `:::caution[Workflow file must live on the default branch]`
- All others: 0 admonitions

Suggested titles (verify against source H1):

| Source | Title | Description |
|---|---|---|
| `bugpocer.md` | `BugPoCer GitHub Action` | `Run BugPoCer in CI on pull requests.` |
| `integrated-security.md` | `Integrated Security` | `Olympix integrated security GitHub Action.` |
| `mutation-test-generator.md` | `Mutation Test Generator` | `Generate mutation tests in CI.` |
| `unit-test-generator.md` | `Unit Test Generator` | `Generate unit tests in CI.` |

- [ ] **Step 1: Create the directory**

```bash
mkdir -p src/content/docs/github-actions
```

- [ ] **Step 2: Migrate github-actions/bugpocer.md**

Read `docs/Github Actions/bugpocer.md`. Create `src/content/docs/github-actions/bugpocer.md`:
- Add frontmatter.
- Strip H1.
- Convert the 1 admonition.
- Rewrite internal links.

- [ ] **Step 3: Migrate github-actions/integrated-security.md**

Read `docs/Github Actions/integrated-security.md`. Create `src/content/docs/github-actions/integrated-security.md`:
- Add frontmatter.
- Strip H1.
- No admonitions.
- Rewrite internal links.

- [ ] **Step 4: Migrate github-actions/mutation-test-generator.md**

Read `docs/Github Actions/mutation-test-generator.md`. Create `src/content/docs/github-actions/mutation-test-generator.md`:
- Add frontmatter.
- Strip H1.
- No admonitions.
- Rewrite internal links.

- [ ] **Step 5: Migrate github-actions/unit-test-generator.md**

Read `docs/Github Actions/unit-test-generator.md`. Create `src/content/docs/github-actions/unit-test-generator.md`:
- Add frontmatter.
- Strip H1.
- No admonitions.
- Rewrite internal links.

- [ ] **Step 6: Verify all GitHub Actions pages render**

Run: `npm run dev`. Visit each:
- `http://localhost:4321/github-actions/bugpocer/`
- `http://localhost:4321/github-actions/integrated-security/`
- `http://localhost:4321/github-actions/mutation-test-generator/`
- `http://localhost:4321/github-actions/unit-test-generator/`

For each: title, body, no errors. The `bugpocer` page should show a single caution aside.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/content/docs/github-actions/
git commit -m "feat: migrate GitHub Actions section"
```

---

## Task 10: Migrate VSCode Extension page (Steps + emoji strip)

**Files:**
- Create: `src/content/docs/vscode-extension/index.mdx`
- Source: `docs/VSCode Extension/index.md` (deleted in Task 12)

**Context:** Convert the "How It Works" numbered list to a `<Steps>` component. Strip the `💡` emoji from the heading and any inline `💡` in prose. The page also embeds two screenshots that appear in the original — preserve them (paths probably need adjustment if the images live elsewhere; if no images are referenced inline, ignore).

No admonitions in this file. Run a quick scan when reading the source to confirm.

- [ ] **Step 1: Inspect source for images and emoji**

Read `docs/VSCode Extension/index.md` in full. Note any `![alt](path)` image references — they were not found in the docs/assets/ scan (only the logo PNG exists), so likely the originals reference external URLs or the embeds are broken/empty. Carry forward exactly what's there.

Run: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' "docs/VSCode Extension/index.md"`
Note all matches — strip each one in the migrated file.

- [ ] **Step 2: Create vscode-extension/index.mdx**

```bash
mkdir -p src/content/docs/vscode-extension
```

Create `src/content/docs/vscode-extension/index.mdx`:

```mdx
---
title: VSCode Extension
description: Real-time vulnerability scanning and quick fixes integrated into VS Code.
---

import { Steps } from '@astrojs/starlight/components';

Our extension is available in the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Olympixai.olympix). Install it to integrate Olympix features directly into your development environment.

## Features

The Olympix VSCode extension brings powerful security analysis right into your editor, helping you write more secure Solidity code.

- **Real-time Vulnerability Scanning:** Get immediate feedback on potential security issues as you type.
- **Automatic Quick Fixes:** Apply suggested code changes to fix common vulnerabilities with a single click.

## Quick Fixes

The **Olympix Quick Fix** feature is designed to accelerate your development workflow by providing instant, actionable solutions to detected vulnerabilities. When our analyzer identifies a potential issue, it may also suggest a code snippet that can resolve it.

### How It Works

<Steps>

1. **Detection:** When a vulnerability is found, it will be highlighted in the "Problems" tab of VS Code, and a squiggle will appear under the affected code.

2. **Action:** A lightbulb icon will appear next to the highlighted line. Click the icon or use the keyboard shortcut (`Ctrl`+`.` on Windows/Linux, `Cmd`+`.` on macOS).

3. **Apply:** Select the "Apply Olympix Quick Fix" option from the context menu to automatically insert the suggested code change.

</Steps>

### Example: Locked Ether Vulnerability

A **"locked ether"** vulnerability occurs when a contract can receive Ether but has no function to withdraw it. Our Quick Fix feature makes resolving this simple.

<Steps>

1. **Vulnerability Detected:** The extension highlights the contract definition, warning that it can receive Ether but has no way to send it out, potentially locking funds permanently.

2. **Apply the Quick Fix:** Clicking the lightbulb icon presents the option to apply the fix.

3. **Result:** The extension automatically inserts a generic `withdraw` function into the contract. This new function contains a placeholder (`owner`) that you should replace with the correct address for withdrawal authorization.

</Steps>
```

If the source page has additional content beyond what's shown above, copy it verbatim with the same emoji-stripping treatment.

- [ ] **Step 3: Verify VSCode page renders**

Run: `npm run dev`. Visit `http://localhost:4321/vscode-extension/`. Verify:
- Title "VSCode Extension" renders.
- "Quick Fixes" heading has no emoji (was `💡 Quick Fixes`).
- The two `<Steps>` blocks render as visually-styled numbered procedures.
- No emojis anywhere in the body.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/vscode-extension/
git commit -m "feat: migrate VSCode Extension page with Steps"
```

---

## Task 11: Add new GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`
- (The old `.github/workflows/ci.yml` is deleted in Task 12)

**Context:** Replaces the MkDocs `gh-deploy` workflow with the official GitHub Actions Pages deploy. Note: the user must manually flip the repo's Pages source to "GitHub Actions" in repo settings before the new deploy will actually publish — that's documented in Task 13.

- [ ] **Step 1: Create deploy.yml**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy docs to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx astro build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`
Expected: No output (success).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow for Starlight"
```

---

## Task 12: Remove MkDocs artifacts

**Files:**
- Delete: `mkdocs.yml`, `mkdocs_serve.sh`, `overrides/` (and `overrides/partials/footer.html`), `docs/` (recursive), `.github/workflows/ci.yml`
- Note: `venv/` is local-only (not tracked in git) — leave as-is locally; it'll be untracked clutter only on this machine.

**Context:** Once content is migrated, all MkDocs files become dead weight. Removing them in the same PR makes the cutover atomic — main goes from "MkDocs site" to "Starlight site" in one merge.

- [ ] **Step 1: Verify migration is complete before deleting**

Run: `ls src/content/docs/ src/content/docs/cli/ src/content/docs/github-actions/ src/content/docs/vscode-extension/`
Expected output (16 files total):
```
src/content/docs/:
config-options.md  ignore-options.md  index.mdx  installation.mdx
src/content/docs/cli/:
analysis.md  bugpocer.md  index.mdx  mutation-testing.md  organization.md  sso.md  unit-testing.md
src/content/docs/github-actions/:
bugpocer.md  integrated-security.md  mutation-test-generator.md  unit-test-generator.md
src/content/docs/vscode-extension/:
index.mdx
```

If any file is missing, do NOT proceed — go back to the relevant migration task.

- [ ] **Step 2: Delete MkDocs files**

```bash
git rm -r mkdocs.yml mkdocs_serve.sh overrides/ docs/ .github/workflows/ci.yml
```

- [ ] **Step 3: Verify nothing important got removed**

Run: `git status`
Expected: Many deletions under `docs/`, `overrides/`, plus the four root files. The Starlight `src/`, `public/`, `package.json`, `astro.config.mjs`, `.github/workflows/deploy.yml` should NOT appear in the status (they're already committed).

- [ ] **Step 4: Verify dev server still runs after deletion**

Run: `npm run dev`. Visit `http://localhost:4321/`. Confirm the landing page still renders. Stop the server.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove MkDocs artifacts after Starlight migration"
```

---

## Task 13: Local QA, build, and PR with cutover instructions

**Files:**
- (no file changes; this is the verification + handoff task)

**Context:** Final pass before pushing. This catches link rot, build errors, and missing pages.

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: Builds to `dist/` with zero errors. Astro reports the count of pages built — should match 16.

If there are warnings about broken internal links, fix them by going back to the appropriate migration task and correcting the link rewrite, then re-run the build.

- [ ] **Step 2: Preview the production build**

Run: `npm run preview`
Visit `http://localhost:4321/`. This serves the actual built `dist/` output, which is what GitHub Pages will serve. Click through every sidebar entry and verify:

- [ ] Landing page (`/`) — CardGrid renders, all 4 cards link correctly.
- [ ] `/installation/` — Tabs work, asides render.
- [ ] `/config-options/` — caution aside renders.
- [ ] `/ignore-options/` — 3 asides render.
- [ ] `/cli/` — long content + LinkCard grid at bottom.
- [ ] `/cli/analysis/` — content + 2 asides.
- [ ] `/cli/bugpocer/` — content + 12 asides.
- [ ] `/cli/mutation-testing/` — content + 1 aside.
- [ ] `/cli/organization/` — content.
- [ ] `/cli/sso/` — content.
- [ ] `/cli/unit-testing/` — content + 6 asides.
- [ ] `/github-actions/bugpocer/` — content + 1 caution aside.
- [ ] `/github-actions/integrated-security/` — content.
- [ ] `/github-actions/mutation-test-generator/` — content.
- [ ] `/github-actions/unit-test-generator/` — content.
- [ ] `/vscode-extension/` — Steps render, no emoji visible.
- [ ] Light/dark theme toggle works.
- [ ] Search (top-right icon) returns results when typing.

Stop the preview server.

- [ ] **Step 3: Final emoji scan**

Run: `grep -rP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src/content/docs/`
Expected: No matches. If any matches appear, edit the offending file to remove them, re-run `npm run build` to verify, and commit the fix.

- [ ] **Step 4: Push the branch and open a PR**

```bash
git push -u origin HEAD
gh pr create --title "Migrate docs from MkDocs Material to Starlight" --body "$(cat <<'EOF'
## Summary
- Replaces MkDocs Material with Astro + Starlight.
- All 16 source pages migrated; 4 use Starlight components (`<Tabs>`, `<CardGrid>`, `<LinkCard>`, `<Steps>`).
- 30 Material admonitions converted to Starlight asides.
- Deploys via `actions/deploy-pages@v4` instead of `mkdocs gh-deploy`.

Design spec: `superpowers/specs/2026-05-11-starlight-migration-design.md`
Implementation plan: `superpowers/plans/2026-05-11-starlight-migration.md`

## Required manual step before merge

Flip the repo's Pages source to GitHub Actions:
1. Open repo Settings → Pages.
2. Set **Source** to **GitHub Actions**.
3. Save.

Without this flip, the new workflow builds successfully but the deploy step will fail (and the live site keeps showing the old MkDocs build from `gh-pages`).

## Test plan
- [ ] Local `npm run build` passes.
- [ ] Local `npm run preview` walkthrough of every sidebar page.
- [ ] After merge, the Actions run for `Deploy docs to GitHub Pages` completes successfully.
- [ ] `https://olympix.github.io/` shows the new Starlight site.
- [ ] Spot-check 5 random pages on the live site.

## Rollback
If the new site is broken on production:
1. `git revert` the merge commit on `main`.
2. Settings → Pages → Source → "Deploy from a branch" → `gh-pages`.
3. The `gh-pages` branch still contains the old MkDocs build until we delete it post-cutover.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Post-merge cleanup (do NOT include in this PR)**

After the new deploy is confirmed healthy on `https://olympix.github.io/`, delete the legacy `gh-pages` branch:

```bash
git push origin --delete gh-pages
```

This is documented here so the operator remembers, but it should NOT be done as part of this PR — keep `gh-pages` available for emergency rollback for at least a few days.
