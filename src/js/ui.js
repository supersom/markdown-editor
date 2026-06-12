const UI = (() => {
  return {
    setRenderOutput(html) {
      document.getElementById('render-output').innerHTML = html;
    },
    setEditRenderOutput(html) {
      document.getElementById('edit-render-output').innerHTML = html;
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
