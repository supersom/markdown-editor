# Dev Log

A chronological record of design decisions and non-obvious insights. *Why*, not *what* — git log has the what.

## 2026-06-12 — Build artifact moves out of git into CI (Pages + Releases)

**Decision:** Stop tracking `dist/markdown-editor.html`. The bundle is now a build artifact produced by CI, not committed source. Three workflows own it: `ci.yml` (test + build on every push/PR), `pages.yml` (deploy to GitHub Pages from `main`), `release.yml` (attach the standalone `.html` to a GitHub Release on `v*` tags).

**Why untrack it:** A committed bundle that's regenerated from `src/` creates stale-bundle churn — every source change produces a large, noisy `dist/` diff, intermediate commits drift out of sync with their source, and the file has to be rebuilt by hand before each commit. Treating it as generated removes all of that; the meaningful history lives in the source commits.

**Why this needs a publish step:** Once `dist/` is git-ignored, a plain `git clone` no longer yields a runnable file. So the distribution model has to fill that gap: Pages serves the always-current app live (tip of `main`), and Releases provide versioned, downloadable standalone files. For a single self-contained HTML app, the file *is* the product, so it must remain trivially obtainable.

**Why the GitHub Actions Pages source (not branch/Jekyll):** With "Source: GitHub Actions", the workflow uploads a pre-built artifact that GitHub serves byte-for-byte — no Jekyll pass. This matters specifically here because the inlined `marked.js` and app JS can contain `{{ }}` / `{% %}` sequences that Jekyll's Liquid processor would mangle in the legacy branch-deploy model. No `_config.yml` and no `.nojekyll` are needed; Jekyll simply never runs.

**Note:** The account-level Pages custom domain redirects `supersom.github.io/markdown-editor/` → `www.somdutta.com/markdown-editor/`; both resolve, the custom domain is canonical.
