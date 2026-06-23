# Markdown Editor

A single-file markdown editor and renderer — no install, no server, no account required.

**Use it:** open the live app at <https://supersom.github.io/markdown-editor/> (always the latest build from `main`), or download a standalone `markdown-editor.html` from the [Releases](https://github.com/supersom/markdown-editor/releases) page and open it in any browser. The downloaded file is fully self-contained, so the "Save in this HTML" workflow keeps working offline.

## What it does

- **Read mode** (default): full-width rendered document, clean typography
- **Edit mode**: split pane — raw markdown on the left, live preview on the right
- **Toolbar**: Bold, Italic, Heading cycle, Inline code, Link, Bullet list, Numbered list
- **Keyboard shortcuts**: Ctrl+B (bold), Ctrl+I (italic)
- **Autosave**: writes to `localStorage` on every keystroke (debounced 500ms) as crash recovery
- **beforeunload guard**: warns before closing a tab with unsaved changes
- **Recovery prompt**: on reopen, offers to restore the previous unsaved session

## Saving

| Button | When visible | What it does |
|---|---|---|
| Save as html | Always | Embeds your markdown into the HTML file itself — one self-contained shareable document |
| Save | After opening an `.md` file (Chrome/Edge only) | Writes back to the opened file in place — no dialog |
| Save as doc (.md) | Always | Opens a file dialog; if a file is already open its name is pre-suggested |

**Save as html** and **Save as doc (.md)** use the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) on Chrome/Edge (native OS dialog). Firefox/Safari fall back to a file download.

**Save** (in-place) is only available on Chrome/Edge where a write handle can be retained after opening a file. On Firefox/Safari it does not appear; use **Save as doc (.md)** instead.

## Opening a file

Click **Open a doc (.md)** to load any `.md` file. The file opens in read mode. On Chrome/Edge the app retains a write handle, and the **Save** button appears for subsequent in-place saves.

## Build

```bash
npm install
node build.js
# → dist/markdown-editor.html (~54KB)
```

The build script inlines `marked.js` (markdown parser), all CSS, and all app JS into a single HTML file.

`dist/` is git-ignored — the bundle is a build artifact, not source. CI builds it on every push; pushes to `main` deploy it to GitHub Pages, and tagging `v*` attaches it to a GitHub Release.

## Test

```bash
npm test
# 50 tests, 6 suites
```

## Architecture

Source is split into focused modules concatenated by `build.js`:

| Module | Responsibility |
|---|---|
| `src/js/state.js` | Singleton app state — mode, content, dirty flag, file handle, document name |
| `src/js/markdown.js` | Thin wrapper around `marked.parse` |
| `src/js/storage.js` | localStorage autosave and crash recovery |
| `src/js/toolbar.js` | Pure text-manipulation functions operating on a textarea element |
| `src/js/file-ops.js` | All file I/O — FSA open/save and download fallbacks |
| `src/js/ui.js` | All DOM reads/writes and mode switching |
| `src/js/main.js` | App init and event wiring |
