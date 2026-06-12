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

## 2026-06-12 17:58 UTC — Gate the Pages deploy on CI passing

**What:** `pages.yml` previously built and deployed to Pages independently of `ci.yml`, running no tests — so a red CI (jest or e2e) could not stop a broken build from going live. Folded the deploy into `ci.yml` as a `deploy` job that `needs: test-build`, and deleted the standalone `pages.yml`.

**How:** The `deploy` job runs only when `test-build` (jest + Playwright e2e + build) succeeds, and is further gated by `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` so PRs and side branches never deploy. It carries the Pages-specific `permissions` (`pages: write`, `id-token: write`), the `concurrency: group: pages`, and the `github-pages` environment. Rather than rebuilding, it pulls the `markdown-editor.html` artifact `test-build` already uploaded (`actions/download-artifact`) and serves that byte-for-byte as `_site/index.html` — so what ships is exactly what was tested, not a fresh rebuild.

**Why this shape (not `workflow_run`):** Considered keeping `pages.yml` and triggering it via `workflow_run` on CI completion, but that's more fragile — it runs from the default-branch workflow file and needs careful `head_sha` checkout — for no benefit. A single workflow with an explicit `needs:` dependency is simpler and makes the gate obvious.

**Tests / verification:** Pushed `df92c63`. CI run `27433434158`: `test-build` ran `17:57:01 → 17:57:43` (success), then `deploy` ran `17:57:47 → 17:58:01` (success). Deploy **started 4s after test-build finished** — it sat queued during the test job, confirming the `needs:` gate held rather than deploying in parallel. Post-deploy, `https://www.somdutta.com/markdown-editor/` returned HTTP 200. Only one workflow (`CI`) now triggers on push; the separate "Deploy to Pages" run is gone.

**Concluding notes:** The tradeoff is latency-to-live — the deploy now waits ~1 min for the full test job (including the Playwright install/run) instead of deploying in parallel. That's correctness over speed, and intended: the whole point is that untested code can't reach production. The backlog's CI/CD section is now clear.

## 2026-06-12 18:09 UTC — Rendered links open in a new tab

**What:** Following a link in the read pane or edit-mode preview unloaded this single-page app, discarding unsaved edits and the open document. Content links now open in a new tab, so the editor/reader (and its unsaved state) is never lost.

**How:** In `ui.js`, both render setters (`setRenderOutput`, `setEditRenderOutput`) now route through a shared `renderInto(id, html)` that, after assigning `innerHTML`, sets `target="_blank"` and `rel="noopener noreferrer"` on `a[href]:not([href^="#"])`. Same-page `#anchors` are excluded — they scroll in place and never navigate away, so they don't need a tab. `rel=noopener` stops the opened page reaching back through `window.opener`.

**Why DOM, not the marked renderer:** marked's `renderer.link` signature changes across major versions (positional `href,title,text` vs a token object), so overriding it is upgrade-fragile. Setting attributes on the already-rendered DOM is version-proof and sits exactly where links are clicked. The self-contained "Save in this HTML" file re-renders from its embedded markdown on open, so it re-applies the behavior — saved files behave identically.

**Tests / verification:** Added 3 jsdom unit tests (content link → target + rel; edit-preview link → target; `#anchor` left alone); suite is 58/58. Also a real-browser Playwright check: the rendered external link had `target=_blank rel=noopener noreferrer`, the hash link's target was `null`, and clicking the external link opened a new tab to `https://example.com/` while the original tab stayed on the editor. Pushed `2a62336`; CI run `27434050209` was green (`test-build` + gated `deploy`) and the live site redeployed.

**Concluding notes:** Both the read pane and edit preview are covered through the single shared helper, so any future render path that goes through the setters inherits the behavior for free.

## 2026-06-12 18:27 UTC — Banner overlap fixed properly (in-flow), superseding the padding hack

**Correction:** The earlier same-day fix that reserved bottom padding on the panes (commit `63d8bf7`) did **not** actually fix the editor case. Real typing still pushed the last lines under the banner.

**Root cause:** The status bar was a `position: fixed` overlay. While typing, the browser auto-scrolls to keep the caret at the bottom of the textarea's *client box* — and that box extended under the overlay, so the caret/last line parked beneath the banner while the reserved padding sat off-screen below it. The padding only ever helped when the textarea was scrolled to its absolute bottom (which reveals the padding). My earlier "proof" did exactly that (`scrollTop = scrollHeight`), which masked the real interactive behavior. More fundamentally: an overlay over an *editable* region can't be cleared with padding, because the browser's caret-scroll is blind to the overlay.

**Fix:** Make `#status-bar` in-flow — removed `position: fixed` / offsets / `z-index`, added `flex-shrink: 0`. As a flex child of the body column it now takes real layout space, and the read/edit panes (`flex: 1`) shrink to sit entirely above it. The textarea's client box ends at the banner top, so caret-scroll keeps the last line visible. This also makes it robust to the banner's *dynamic* height (it wraps to two lines on narrow windows) — no fixed-height assumption remains. Removed the dead padding hacks on `#render-output` / `#editor-right` / `#editor-textarea` and the now-unused `--status-bar-h` / `--action-bar-h` variables.

**Tests / verification:** Reproduced with Playwright real-keyboard typing (the previous scripted `scrollTop` repro was the thing that hid the bug): `line 30` was hidden before, fully visible after (before/after screenshots). Rewrote the e2e guard from a padding assertion to a geometric **no-overlap** invariant — `edit-pane`/`read-pane` bottom ≤ `status-bar` top — including a narrow-viewport (360px) case where the banner wraps to two lines. All 3 pass on the fix and **all 3 fail on the restored overlay CSS**. jest 58/58. Pushed `51d6631`; CI run `27434959578` green (`test-build` + gated `deploy`); site redeployed.

**Concluding notes:** Tradeoff is a one-time layout shift when the banner first appears (content shrinks by its height) — acceptable, arguably useful feedback. Lesson for next time: padding can't substitute for layout when a fixed overlay sits over a scrollable/editable region, and interactive bugs must be verified with real input (typing), not a scrolled-to-bottom snapshot that happens to reveal reserved space.
