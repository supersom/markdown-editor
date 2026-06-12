import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'url';
import path from 'path';

// Regression guard for: "the last line of the editor goes under the unsaved-changes banner".
// The banner is in-flow (not a fixed overlay), so the read/edit panes shrink to sit
// entirely above it — verified geometrically: no content pane may overlap the banner.
// (A fixed overlay can't be fixed with padding: while typing, the browser scrolls the
// caret to the textarea's client-box bottom, which sits under the overlay.)

const appUrl = pathToFileURL(path.resolve('dist/markdown-editor.html')).href;

async function bottomOf(locator) {
  const b = await locator.boundingBox();
  return b.y + b.height;
}

async function dirtyEditor(page) {
  await page.goto(appUrl); // fresh context -> no recovery -> lands in edit mode
  await page.fill('#editor-textarea', Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n'));
  await page.locator('#editor-textarea').evaluate((ta) => {
    ta.dispatchEvent(new Event('input', { bubbles: true })); // marks dirty -> banner shows
  });
  await expect(page.locator('#status-bar')).toBeVisible();
}

test('banner does not overlap the editor pane', async ({ page }) => {
  await dirtyEditor(page);
  const barTop = (await page.locator('#status-bar').boundingBox()).y;
  expect(await bottomOf(page.locator('#edit-pane'))).toBeLessThanOrEqual(barTop + 1);
});

test('banner does not overlap the reader pane', async ({ page }) => {
  await dirtyEditor(page);
  await page.click('#btn-toggle-mode'); // -> read mode
  const barTop = (await page.locator('#status-bar').boundingBox()).y;
  expect(await bottomOf(page.locator('#read-pane'))).toBeLessThanOrEqual(barTop + 1);
});

test('banner stays clear even when it wraps to multiple lines (narrow viewport)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 600 });
  await dirtyEditor(page);
  const bar = await page.locator('#status-bar').boundingBox();
  expect(bar.height).toBeGreaterThan(40); // confirm the banner actually wrapped past one line
  expect(await bottomOf(page.locator('#edit-pane'))).toBeLessThanOrEqual(bar.y + 1);
});
