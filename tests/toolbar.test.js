const Toolbar = require('../src/js/toolbar');

function ta(value, start, end) {
  const el = document.createElement('textarea');
  el.value = value;
  el.selectionStart = start;
  el.selectionEnd = end;
  return el;
}

test('wrapSelection wraps selected text', () => {
  const el = ta('hello world', 6, 11);
  Toolbar.wrapSelection(el, '**', '**', 'bold text');
  expect(el.value).toBe('hello **world**');
});
test('wrapSelection inserts placeholder when no selection', () => {
  const el = ta('hello ', 6, 6);
  Toolbar.wrapSelection(el, '**', '**', 'bold text');
  expect(el.value).toBe('hello **bold text**');
});
test('applyHeading adds H1 to plain line', () => {
  const el = ta('Hello', 2, 2);
  Toolbar.applyHeading(el);
  expect(el.value).toBe('# Hello');
});
test('applyHeading cycles H1 to H2', () => {
  const el = ta('# Hello', 3, 3);
  Toolbar.applyHeading(el);
  expect(el.value).toBe('## Hello');
});
test('applyHeading cycles H2 to H3', () => {
  const el = ta('## Hello', 4, 4);
  Toolbar.applyHeading(el);
  expect(el.value).toBe('### Hello');
});
test('applyHeading cycles H3 to plain', () => {
  const el = ta('### Hello', 5, 5);
  Toolbar.applyHeading(el);
  expect(el.value).toBe('Hello');
});
test('applyBullet adds bullet prefix', () => {
  const el = ta('item', 2, 2);
  Toolbar.applyBullet(el);
  expect(el.value).toBe('- item');
});
test('applyBullet does not double-prefix', () => {
  const el = ta('- item', 3, 3);
  Toolbar.applyBullet(el);
  expect(el.value).toBe('- item');
});
test('applyNumbered adds numbered prefix', () => {
  const el = ta('item', 2, 2);
  Toolbar.applyNumbered(el);
  expect(el.value).toBe('1. item');
});
test('applyNumbered does not double-prefix', () => {
  const el = ta('1. item', 4, 4);
  Toolbar.applyNumbered(el);
  expect(el.value).toBe('1. item');
});
