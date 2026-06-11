const UI = require('../src/js/ui');

const DOM = `
  <header id="action-bar">
    <div class="action-left"><button id="btn-open">Open MD file</button></div>
    <div class="action-center">
      <span id="doc-name">Untitled</span>
      <button id="btn-save-html">Save in this HTML</button>
      <button id="btn-save-md">Save as separate document</button>
    </div>
    <div class="action-right"><button id="btn-toggle-mode">Edit</button></div>
  </header>
  <main id="read-pane"><article id="render-output"></article></main>
  <div id="edit-pane" hidden>
    <div id="editor-left">
      <div id="toolbar"></div>
      <textarea id="editor-textarea"></textarea>
    </div>
    <div id="editor-divider"></div>
    <div id="editor-right"><article id="edit-render-output"></article></div>
  </div>
  <div id="status-bar" role="status" aria-live="polite" hidden></div>
  <script type="text/markdown" id="md-content"></script>
`;

beforeEach(() => { document.body.innerHTML = DOM; });

test('setRenderOutput sets innerHTML', () => {
  UI.setRenderOutput('<h1>Hi</h1>');
  expect(document.getElementById('render-output').innerHTML).toBe('<h1>Hi</h1>');
});
test('setEditRenderOutput sets innerHTML', () => {
  UI.setEditRenderOutput('<p>Hi</p>');
  expect(document.getElementById('edit-render-output').innerHTML).toBe('<p>Hi</p>');
});
test('getEmbeddedContent reads md-content', () => {
  document.getElementById('md-content').textContent = '# Hello';
  expect(UI.getEmbeddedContent()).toBe('# Hello');
});
test('getTextareaValue reads textarea', () => {
  document.getElementById('editor-textarea').value = '# Test';
  expect(UI.getTextareaValue()).toBe('# Test');
});
test('setTextareaValue sets textarea', () => {
  UI.setTextareaValue('# Hello');
  expect(document.getElementById('editor-textarea').value).toBe('# Hello');
});
test('showStatusBar true makes visible', () => {
  UI.showStatusBar(true);
  expect(document.getElementById('status-bar').hidden).toBe(false);
});
test('showStatusBar false hides', () => {
  document.getElementById('status-bar').hidden = false;
  UI.showStatusBar(false);
  expect(document.getElementById('status-bar').hidden).toBe(true);
});
test('setDocumentNameDisplay updates text', () => {
  UI.setDocumentNameDisplay('notes.md');
  expect(document.getElementById('doc-name').textContent).toBe('notes.md');
});
test('switchToEditMode shows edit pane, hides read pane', () => {
  UI.switchToEditMode();
  expect(document.getElementById('edit-pane').hidden).toBe(false);
  expect(document.getElementById('read-pane').hidden).toBe(true);
  expect(document.getElementById('btn-toggle-mode').textContent).toBe('Read');
});
test('switchToReadMode shows read pane, hides edit pane', () => {
  UI.switchToEditMode();
  UI.switchToReadMode();
  expect(document.getElementById('read-pane').hidden).toBe(false);
  expect(document.getElementById('edit-pane').hidden).toBe(true);
  expect(document.getElementById('btn-toggle-mode').textContent).toBe('Edit');
});
test('showRecoveryPrompt returns true when confirmed', () => {
  window.confirm = jest.fn(() => true);
  expect(UI.showRecoveryPrompt()).toBe(true);
  expect(window.confirm).toHaveBeenCalledWith(
    'You have unsaved changes from a previous session. Restore them?'
  );
});
test('showRecoveryPrompt returns false when declined', () => {
  window.confirm = jest.fn(() => false);
  expect(UI.showRecoveryPrompt()).toBe(false);
});
