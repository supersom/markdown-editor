const FileOps = require('../src/js/file-ops');

function makeFsaHandle(content, name = 'test.md') {
  return {
    name,
    getFile: jest.fn().mockResolvedValue(new File([content], name)),
    createWritable: jest.fn().mockResolvedValue({
      write: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    }),
  };
}

test('readFileHandle reads text content', async () => {
  const handle = makeFsaHandle('# Hello');
  expect(await FileOps.readFileHandle(handle)).toBe('# Hello');
});

test('buildMdBlob creates Blob with text/markdown type', () => {
  const blob = FileOps.buildMdBlob('# Hello');
  expect(blob.type).toBe('text/markdown');
});

test('buildHtmlString contains DOCTYPE and embedded content', () => {
  const html = FileOps.buildHtmlString(
    '<html><body><script type="text/markdown" id="md-content"></script></body></html>',
    '# Test'
  );
  expect(html).toContain('<!DOCTYPE html>');
  expect(html).toContain('# Test');
});

test('buildHtmlString escapes </script> in content', () => {
  const html = FileOps.buildHtmlString(
    '<html><body><script type="text/markdown" id="md-content"></script></body></html>',
    'bad </script> end'
  );
  expect(html).not.toMatch(/<\/script>bad/);
});

test('buildHtmlString handles $ signs in content without corruption', () => {
  const html = FileOps.buildHtmlString(
    '<html><body><script type="text/markdown" id="md-content"></script></body></html>',
    'Price: $100 & $200'
  );
  expect(html).toContain('Price: $100 & $200');
});

test('buildHtmlString resets ephemeral UI to initial state', () => {
  const dirty = `<html><body>
    <div id="status-bar" role="status" aria-live="polite">unsaved</div>
    <button id="btn-save">Save</button>
    <main id="read-pane" hidden></main>
    <div id="edit-pane"></div>
    <button id="btn-toggle-mode">Read</button>
    <script type="text/markdown" id="md-content"></script>
  </body></html>`;
  const html = FileOps.buildHtmlString(dirty, '# Test');
  expect(html).toMatch(/id="status-bar"[^>]* hidden/);
  expect(html).toMatch(/id="btn-save"[^>]* hidden/);
  expect(html).toMatch(/id="edit-pane"[^>]* hidden/);
  expect(html).not.toMatch(/id="read-pane"[^>]* hidden/);
  expect(html).toContain('>Edit</button>');
});

test('buildHtmlString handles hidden="" attribute form from browser serialization', () => {
  const dirty = `<html><body>
    <div id="status-bar" role="status" aria-live="polite">unsaved</div>
    <button id="btn-save">Save</button>
    <main id="read-pane" hidden=""></main>
    <div id="edit-pane" hidden=""></div>
    <button id="btn-toggle-mode">Read</button>
    <script type="text/markdown" id="md-content"></script>
  </body></html>`;
  const html = FileOps.buildHtmlString(dirty, '# Test');
  // read-pane must be visible — hidden="" must be stripped
  expect(html).not.toMatch(/id="read-pane"[^>]* hidden/);
  // edit-pane must be hidden — hidden="" must be normalised to plain hidden
  expect(html).toMatch(/id="edit-pane"[^>]* hidden/);
  // no double-hidden artifacts
  expect(html).not.toMatch(/hidden[^>]*hidden/);
});
