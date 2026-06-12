# Dev Log

A chronological record of design decisions and non-obvious insights. *Why*, not *what* — git log has the what.

## 2026-06-12 — Build artifact moves out of git into CI (Pages + Releases)

**Decision:** Stop tracking `dist/markdown-editor.html`. The bundle is now a build artifact produced by CI, not committed source. Three workflows own it: `ci.yml` (test + build on every push/PR), `pages.yml` (deploy to GitHub Pages from `main`), `release.yml` (attach the standalone `.html` to a GitHub Release on `v*` tags).

**Why untrack it:** A committed bundle that's regenerated from `src/` creates stale-bundle churn — every source change produces a large, noisy `dist/` diff, intermediate commits drift out of sync with their source, and the file has to be rebuilt by hand before each commit. Treating it as generated removes all of that; the meaningful history lives in the source commits.

**Why this needs a publish step:** Once `dist/` is git-ignored, a plain `git clone` no longer yields a runnable file. So the distribution model has to fill that gap: Pages serves the always-current app live (tip of `main`), and Releases provide versioned, downloadable standalone files. For a single self-contained HTML app, the file *is* the product, so it must remain trivially obtainable.

**Why the GitHub Actions Pages source (not branch/Jekyll):** With "Source: GitHub Actions", the workflow uploads a pre-built artifact that GitHub serves byte-for-byte — no Jekyll pass. This matters specifically here because the inlined `marked.js` and app JS can contain `{{ }}` / `{% %}` sequences that Jekyll's Liquid processor would mangle in the legacy branch-deploy model. No `_config.yml` and no `.nojekyll` are needed; Jekyll simply never runs.

**Note:** The account-level Pages custom domain redirects `supersom.github.io/markdown-editor/` → `www.somdutta.com/markdown-editor/`; both resolve, the custom domain is canonical.

## 2026-06-12 17:40 UTC — Cache Playwright Chromium in CI

**What:** `ci.yml` was re-downloading the ~130MB Chromium browser on every run, because GitHub Actions runners are ephemeral (blank VM each run). Added an `actions/cache@v4` step that persists `~/.cache/ms-playwright` across runs.

**How:** The cache key is `playwright-${{ hashFiles('package-lock.json') }}`. On a hit, the browser binary is restored and we skip the download, running only `npx playwright install-deps chromium` (the OS-level libs live in apt paths, not in the cached dir, so they can't be restored from cache). On a miss, the full `npx playwright install --with-deps chromium` runs and the post-step saves the browser to cache. Keying on the lockfile hash means bumping `@playwright/test` changes the key → automatic cache bust → fresh browser, so there's no risk of running a stale browser against a newer Playwright.

**Tests / verification:** Pushed as `b0d5a44`; watched CI run `27432560119` to completion. As expected for a first run with a new key, the cache step logged `Cache not found for input keys: playwright-a35a…`, the full install ran, the e2e suite passed (`✓ every scrollable pane clears the fixed unsaved-changes banner`, 258ms), and the post-run step logged `Cache saved with key: playwright-a35a…`. So the miss→install→save path is confirmed; the next run on the same lockfile will hit and skip the download. CI ended green.

**Concluding notes:** Savings are modest now (~20–30s/run) but scale if more browsers are added (Firefox/WebKit multiply the download). The hit/miss conditional is slightly more YAML than a flat `install`, but it's Playwright's documented pattern and is what actually realizes the saving — a plain cache without skipping the install would still pay the download. The system-deps caveat (apt libs not cacheable) is why the `install-deps` step remains on the hit path.
