# Migrate user docs from MkDocs Material to Starlight

**Date:** 2026-05-11
**Status:** Approved design, pending implementation plan

## Overview

Replace the current MkDocs Material site at `https://olympix.github.io/` with an Astro + Starlight site. Same hosting (GitHub Pages, org root site, no custom domain). Engine swap with light cleanup — same content, normalized file names, default Starlight theme.

## Goals

- Modernize the docs site with a framework actively used by tech companies (Cloudflare Workers, Bun ecosystem, etc.).
- Stay on GitHub Pages — no SaaS dependency.
- Migrate the existing 16 Markdown pages with no content rewrites.
- Use Starlight conventions for visual treatment (`<CardGrid>`, `<LinkCard>`, `<Tabs>`, `<Steps>`) where they meaningfully improve a page.
- Cut over with one PR; preserve the ability to roll back.

## Non-goals

- No URL preservation. No external links rely on existing paths.
- No content restructuring or rewrites. Section organization stays the same.
- No custom branding beyond Starlight defaults.
- No search service integration (Algolia, etc.). Use Starlight's built-in Pagefind.
- No PR previews. Local `npm run dev` is sufficient for review.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro + Starlight | Best static-site performance for the modern docs aesthetic, ships zero JS by default, deploys cleanly to GitHub Pages |
| URL stability | Free to restructure | No external references to existing paths |
| Scope | Engine swap + light cleanup | Normalize folder/file names, no content rewrites |
| Visual style | Starlight defaults | Modern look with no theming work |
| Rollout | Feature branch, switch when ready | MkDocs keeps serving production until merge |
| Pages deploy | `actions/deploy-pages@v4` | Official GitHub-recommended path; no `gh-pages` branch pollution |
| Conversion strategy | Manual per-file | 17 files is tractable; avoids regex risk |
| File format | `.md` by default, `.mdx` only when components needed | Matches Starlight's own convention |
| Search | Pagefind (built-in) | Free, static, no service required |
| Emojis | Strip from all content | Including the existing `💡` in the VSCode page |

## Project layout

```
olympix.github.io/
├── .github/workflows/deploy.yml    # rewritten: build + deploy-pages@v4
├── astro.config.mjs                # Starlight config
├── package.json                    # astro + @astrojs/starlight
├── tsconfig.json
├── public/
│   └── olymp-x-logo.png            # moved from docs/assets/
└── src/
    ├── content.config.ts           # Starlight content collection schema
    └── content/docs/
        ├── index.mdx
        ├── installation.mdx
        ├── config-options.md
        ├── ignore-options.md
        ├── cli/
        │   ├── index.mdx
        │   ├── analysis.md
        │   ├── bugpocer.md
        │   ├── mutation-testing.md
        │   ├── organization.md
        │   ├── sso.md
        │   └── unit-testing.md
        ├── github-actions/
        │   ├── bugpocer.md
        │   ├── integrated-security.md
        │   ├── mutation-test-generator.md
        │   └── unit-test-generator.md
        └── vscode-extension/
            └── index.mdx
```

**To delete from `main` on this branch:** `mkdocs.yml`, `mkdocs_serve.sh`, `overrides/`, `venv/`, `docs/` (after content moves), `.github/workflows/ci.yml` (replaced by `deploy.yml`).

## Content mapping

| Source path | Destination path | Format | Notes |
|---|---|---|---|
| `docs/index.md` | `src/content/docs/index.mdx` | `.mdx` | Convert "Contents" list to `<CardGrid>` of `<LinkCard>` |
| `docs/Installation.md` | `src/content/docs/installation.mdx` | `.mdx` | Convert 6 `=== "..."` blocks to `<Tabs>` / `<TabItem>` |
| `docs/ConfigOptions.md` | `src/content/docs/config-options.md` | `.md` | Plain rename + link fixes |
| `docs/IgnoreOptions.md` | `src/content/docs/ignore-options.md` | `.md` | Plain rename + link fixes |
| `docs/CLI/index.md` | `src/content/docs/cli/index.mdx` | `.mdx` | Convert "Helpful Links" section to `<CardGrid>` of `<LinkCard>` |
| `docs/CLI/Analysis.md` | `src/content/docs/cli/analysis.md` | `.md` | |
| `docs/CLI/BugPoCer.md` | `src/content/docs/cli/bugpocer.md` | `.md` | |
| `docs/CLI/Mutation Testing.md` | `src/content/docs/cli/mutation-testing.md` | `.md` | |
| `docs/CLI/Organization.md` | `src/content/docs/cli/organization.md` | `.md` | |
| `docs/CLI/SSO.md` | `src/content/docs/cli/sso.md` | `.md` | |
| `docs/CLI/Unit Testing.md` | `src/content/docs/cli/unit-testing.md` | `.md` | |
| `docs/Github Actions/bugpocer.md` | `src/content/docs/github-actions/bugpocer.md` | `.md` | |
| `docs/Github Actions/integrated-security.md` | `src/content/docs/github-actions/integrated-security.md` | `.md` | |
| `docs/Github Actions/mutation-test-generator.md` | `src/content/docs/github-actions/mutation-test-generator.md` | `.md` | |
| `docs/Github Actions/unit-test-generator.md` | `src/content/docs/github-actions/unit-test-generator.md` | `.md` | |
| `docs/VSCode Extension/index.md` | `src/content/docs/vscode-extension/index.mdx` | `.mdx` | Strip `💡` emoji; convert "How It Works" numbered list to `<Steps>` |
| `docs/assets/olymp-x-logo.png` | `public/olymp-x-logo.png` | — | Reference as `/olymp-x-logo.png` |

**Total:** 4 `.mdx`, 12 `.md` (16 content pages), 1 image asset.

## Markdown conversion rules

Applied to every file:

1. **Add Starlight frontmatter:**
   ```yaml
   ---
   title: <page title>
   description: <one-line summary, optional but recommended>
   ---
   ```
2. **Strip the leading `# Title` H1** from the body (Starlight renders the title from frontmatter).
3. **Rewrite internal links:**
   - `./Installation.md` → `/installation/`
   - `./CLI/index.md` → `/cli/`
   - `./Github%20Actions/integrated-security.md` → `/github-actions/integrated-security/`
   - Drop `.md` extensions, lowercase, hyphenate spaces.
4. **Rewrite image refs:** `assets/olymp-x-logo.png` → `/olymp-x-logo.png`.
5. **Strip emojis** from headings and prose. Run a scan (`grep -rP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' docs/`) during implementation to catch any beyond the known `💡` on the VSCode page.
6. **Code blocks, external links, mailto links:** unchanged.

### Component upgrades (`.mdx` files only)

**`installation.mdx`:**
```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
  <TabItem label="osx-arm64">...content...</TabItem>
  <TabItem label="osx-x64">...content...</TabItem>
  <TabItem label="win-arm64">...content...</TabItem>
  <TabItem label="win-x64">...content...</TabItem>
  <TabItem label="linux-arm64">...content...</TabItem>
  <TabItem label="linux-x64">...content...</TabItem>
</Tabs>
```

**`index.mdx` (landing page):**
```mdx
import { CardGrid, LinkCard } from '@astrojs/starlight/components';

<CardGrid>
  <LinkCard title="Installation" href="/installation/" description="Install the CLI and VSCode extension." />
  <LinkCard title="CLI" href="/cli/" description="Commands, options, and usage examples." />
  <LinkCard title="GitHub Actions" href="/github-actions/integrated-security/" description="CI integrations." />
  <LinkCard title="VSCode Extension" href="/vscode-extension/" description="Real-time scanning in your editor." />
</CardGrid>
```

**`cli/index.mdx` ("Helpful Links" section):** `<CardGrid>` of `<LinkCard>` for the six destination pages currently listed at the bottom of the page.

**`vscode-extension/index.mdx` ("How It Works" section):**
```mdx
import { Steps } from '@astrojs/starlight/components';

<Steps>
1. **Detection:** When a vulnerability is found...
2. **Action:** A lightbulb icon appears...
3. **Apply:** Select the "Apply Olympix Quick Fix" option...
</Steps>
```

## Sidebar configuration

Manually configured in `astro.config.mjs` for ordering control:

```js
sidebar: [
  { label: 'Installation', link: '/installation/' },
  { label: 'Config Options', link: '/config-options/' },
  { label: 'Ignore Options', link: '/ignore-options/' },
  { label: 'CLI', autogenerate: { directory: 'cli' } },
  { label: 'GitHub Actions', autogenerate: { directory: 'github-actions' } },
  { label: 'VSCode Extension', autogenerate: { directory: 'vscode-extension' } },
]
```

## CI / deploy

New workflow at `.github/workflows/deploy.yml`:

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

The old `.github/workflows/ci.yml` (which calls `mkdocs gh-deploy`) is deleted in this same PR.

## Rollout sequence

1. **Create branch** `feat/migrate-to-starlight` (in a worktree so MkDocs stays runnable on `main`).
2. **Scaffold Astro + Starlight** — `npm create astro@latest` with Starlight starter, configure `astro.config.mjs` with `site: 'https://olympix.github.io/'`, default theme, sidebar.
3. **Migrate content** per the mapping table and conversion rules.
4. **Local QA:** `npm run dev`. Click through every page. Verify:
   - All internal links resolve (no 404s).
   - Search returns results across all pages.
   - Light/dark toggle works.
   - The four landing-page `<LinkCard>`s navigate correctly.
   - The Installation `<Tabs>` switch correctly.
   - The VSCode `<Steps>` render correctly.
   - Logo displays.
5. **Build verification:** `npm run build` exits zero with no warnings about broken links or missing assets.
6. **Open PR.** Quick visual review.
7. **One-time repo settings flip** (manual, by user): GitHub repo → Settings → Pages → Source = "GitHub Actions". Hard cutover — the next push to `main` deploys via the new workflow.
8. **Merge PR.** New `deploy.yml` runs, site goes live with Starlight.
9. **Delete the `gh-pages` branch** once the new deploy is confirmed healthy.

## Rollback plan

If anything breaks post-merge:

1. `git revert` the merge commit on `main`.
2. Flip GitHub Pages source back: Settings → Pages → Source = "Deploy from a branch" → `gh-pages`.
3. The `gh-pages` branch is preserved until step 9 of the rollout, so the old MkDocs build is still deployable.

## Open questions

None at this time. All decisions captured above.
