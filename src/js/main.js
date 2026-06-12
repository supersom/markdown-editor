(function () {
  function nameFromContent(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  function loadContent(content, name) {
    State.setContent(content);
    State.setDocumentName(name);
    UI.setTextareaValue(content);
    UI.setDocumentNameDisplay(name);
    document.title = name + ' — Markdown Editor';
    const html = Markdown.renderMarkdown(content);
    UI.setRenderOutput(html);
    UI.setEditRenderOutput(html);
  }

  function markClean() {
    State.setDirty(false);
    UI.showStatusBar(false);
    UI.showSaveButton(false);
    Storage.clearRecovery();
  }

  function markDirty() {
    State.setDirty(true);
    UI.showStatusBar(true);
    UI.showSaveButton(true);
    Storage.autosave(State.getContent());
  }

  // Init divider drag
  UI.initDivider();

  // Init: determine starting content and mode
  const embedded = UI.getEmbeddedContent().trim();
  if (Storage.hasRecovery()) {
    if (UI.showRecoveryPrompt()) {
      const recovered = Storage.getRecovery();
      loadContent(recovered, nameFromContent(recovered));
      markDirty();
    } else {
      Storage.clearRecovery();
      UI.setTextareaValue('');
      if (embedded) {
        loadContent(embedded, nameFromContent(embedded));
      } else {
        UI.switchToEditMode();
        State.setMode('edit');
      }
    }
  } else if (embedded) {
    loadContent(embedded, nameFromContent(embedded));
  } else {
    UI.switchToEditMode();
    State.setMode('edit');
    // Sync render with any browser-restored textarea value (session restore / bfcache)
    const restoredValue = UI.getTextareaValue();
    if (restoredValue) {
      State.setContent(restoredValue);
      UI.setEditRenderOutput(Markdown.renderMarkdown(restoredValue));
      markDirty();
    }
  }

  // Mode toggle
  document.getElementById('btn-toggle-mode').addEventListener('click', () => {
    if (State.getMode() === 'read') {
      UI.setEditRenderOutput(Markdown.renderMarkdown(State.getContent()));
      UI.switchToEditMode();
      State.setMode('edit');
    } else {
      UI.setRenderOutput(Markdown.renderMarkdown(State.getContent()));
      UI.switchToReadMode();
      State.setMode('read');
    }
  });

  // Textarea: live render + dirty tracking
  document.getElementById('editor-textarea').addEventListener('input', (e) => {
    State.setContent(e.target.value);
    UI.setEditRenderOutput(Markdown.renderMarkdown(e.target.value));
    markDirty();
  });

  // Toolbar button clicks
  document.getElementById('toolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const ta = document.getElementById('editor-textarea');
    const action = btn.dataset.action;
    if (action === 'bold')     Toolbar.wrapSelection(ta, '**', '**', 'bold text');
    if (action === 'italic')   Toolbar.wrapSelection(ta, '_', '_', 'italic text');
    if (action === 'heading')  Toolbar.applyHeading(ta);
    if (action === 'code')     Toolbar.wrapSelection(ta, '`', '`', 'code');
    if (action === 'link')     Toolbar.wrapSelection(ta, '[', '](url)', 'link text');
    if (action === 'bullet')   Toolbar.applyBullet(ta);
    if (action === 'numbered') Toolbar.applyNumbered(ta);
    ta.focus();
  });

  // Keyboard shortcuts
  document.getElementById('editor-textarea').addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const ta = e.target;
    if (e.key === 'b') { e.preventDefault(); Toolbar.wrapSelection(ta, '**', '**', 'bold text'); }
    if (e.key === 'i') { e.preventDefault(); Toolbar.wrapSelection(ta, '_', '_', 'italic text'); }
  });

  // Open MD file
  document.getElementById('btn-open').addEventListener('click', async () => {
    const result = await FileOps.openMdFile();
    if (!result) return;
    State.setFileHandle(result.handle);
    loadContent(result.content, result.name);
    markClean();
    UI.switchToReadMode();
    State.setMode('read');
  });

  // Save — in-place to opened .md if handle exists, otherwise save as HTML
  document.getElementById('btn-save').addEventListener('click', async () => {
    if (State.getFileHandle()) {
      const result = await FileOps.saveAsMd(
        State.getContent(),
        State.getFileHandle(),
        State.getDocumentName()
      );
      if (!result) return;
      if (result.handle) {
        State.setFileHandle(result.handle);
        State.setDocumentName(result.name);
        UI.setDocumentNameDisplay(result.name);
        document.title = result.name + ' — Markdown Editor';
      }
      markClean();
    } else {
      const saved = await FileOps.saveAsHtml(State.getContent());
      if (saved) markClean();
    }
  });

  // Save in this HTML
  document.getElementById('btn-save-html').addEventListener('click', async () => {
    const saved = await FileOps.saveAsHtml(State.getContent());
    if (saved) markClean();
  });

  // Save as separate document — always opens dialog, suggests current doc name
  document.getElementById('btn-save-md').addEventListener('click', async () => {
    const result = await FileOps.saveAsMd(
      State.getContent(),
      null,
      State.getDocumentName()
    );
    if (!result) return;
    if (result.handle) {
      State.setFileHandle(result.handle);
      State.setDocumentName(result.name);
      UI.setDocumentNameDisplay(result.name);
      document.title = result.name + ' — Markdown Editor';
    }
    markClean();
  });

  // beforeunload guard
  window.addEventListener('beforeunload', (e) => {
    if (State.isDirty()) { e.preventDefault(); e.returnValue = ''; }
  });
})();
