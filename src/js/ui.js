const UI = (() => {
  function renderInto(id, html) {
    const el = document.getElementById(id);
    el.innerHTML = html;
    // Open content links in a new tab so following one never unloads the
    // editor/reader (and its unsaved changes). Same-page #anchors don't
    // navigate away, so they're left to scroll in place.
    el.querySelectorAll('a[href]:not([href^="#"])').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }
  return {
    setRenderOutput(html) {
      renderInto('render-output', html);
    },
    setEditRenderOutput(html) {
      renderInto('edit-render-output', html);
    },
    getEmbeddedContent() {
      return document.getElementById('md-content').textContent;
    },
    getTextareaValue() {
      return document.getElementById('editor-textarea').value;
    },
    setTextareaValue(text) {
      document.getElementById('editor-textarea').value = text;
    },
    showStatusBar(visible) {
      document.getElementById('status-bar').hidden = !visible;
    },
    showSaveButton(visible) {
      document.getElementById('btn-save').hidden = !visible;
    },
    setDocumentNameDisplay(name) {
      document.getElementById('doc-name').textContent = name;
    },
    switchToEditMode() {
      document.getElementById('read-pane').hidden = true;
      document.getElementById('edit-pane').hidden = false;
      document.getElementById('btn-toggle-mode').textContent = 'Read';
    },
    switchToReadMode() {
      document.getElementById('edit-pane').hidden = true;
      document.getElementById('read-pane').hidden = false;
      document.getElementById('btn-toggle-mode').textContent = 'Edit';
    },
    showRecoveryPrompt() {
      return confirm('You have unsaved changes from a previous session. Restore them?');
    },
    initDivider() {
      const divider = document.getElementById('editor-divider');
      const left = document.getElementById('editor-left');
      const pane = document.getElementById('edit-pane');
      let dragging = false;
      divider.addEventListener('mousedown', () => { dragging = true; pane.classList.add('dragging'); });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const rect = pane.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        const clamped = Math.max(20, Math.min(80, pct));
        left.style.flex = 'none';
        left.style.width = clamped + '%';
      });
      document.addEventListener('mouseup', () => { dragging = false; pane.classList.remove('dragging'); });
    },
  };
})();

if (typeof module !== 'undefined') module.exports = UI;
