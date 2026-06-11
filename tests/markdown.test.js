const Markdown = require('../src/js/markdown');

test('renders h1', () => {
  expect(Markdown.renderMarkdown('# Hello')).toContain('<h1>Hello</h1>');
});
test('renders bold', () => {
  expect(Markdown.renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
});
test('renders link', () => {
  expect(Markdown.renderMarkdown('[text](https://example.com)')).toContain('href="https://example.com"');
});
test('empty string returns empty string', () => {
  expect(Markdown.renderMarkdown('')).toBe('');
});
