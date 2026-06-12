import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'url';
import path from 'path';

// Regression guard for: "the unsaved-changes banner obscures the last line".
// The status bar is a fixed overlay (position: fixed; bottom: 0), so every
// scrollable pane must reserve bottom padding >= the bar's height, otherwise
// its last line scrolls underneath the banner. Verified in a real browser
// because jsdom has no layout engine (no computed calc(), no geometry).

const appUrl = pathToFileURL(path.resolve('dist/markdown-editor.html')).href;

test('every scrollable pane clears the fixed unsaved-changes banner', async ({ page }) => {
  await page.goto(appUrl); // fresh context -> no recovery -> lands in edit mode
  await page.fill('#editor-textarea', Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n'));
  await page.locator('#editor-textarea').evaluate((ta) => {
    ta.dispatchEvent(new Event('input', { bubbles: true })); // marks dirty -> banner shows
  });
  await expect(page.locator('#status-bar')).toBeVisible();

  const barH = (await page.locator('#status-bar').boundingBox()).height;

  // #render-output = read pane, #editor-right = live preview, #editor-textarea = editor.
  for (const sel of ['#render-output', '#editor-right', '#editor-textarea']) {
    const padBottom = await page.locator(sel).evaluate(
      (el) => parseFloat(getComputedStyle(el).paddingBottom)
    );
    expect(padBottom, `${sel} bottom padding must clear the ${barH}px banner`).toBeGreaterThanOrEqual(barH);
  }
});
