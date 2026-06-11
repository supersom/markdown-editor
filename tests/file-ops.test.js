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
