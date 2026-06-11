const State = require('../src/js/state');

beforeEach(() => State.reset());

test('default mode is read', () => {
  expect(State.getMode()).toBe('read');
});
test('setMode updates mode', () => {
  State.setMode('edit');
  expect(State.getMode()).toBe('edit');
});
test('default content is empty string', () => {
  expect(State.getContent()).toBe('');
});
test('setContent updates content', () => {
  State.setContent('# Hello');
  expect(State.getContent()).toBe('# Hello');
});
test('default isDirty is false', () => {
  expect(State.isDirty()).toBe(false);
});
test('setDirty marks dirty', () => {
  State.setDirty(true);
  expect(State.isDirty()).toBe(true);
});
test('default documentName is Untitled', () => {
  expect(State.getDocumentName()).toBe('Untitled');
});
test('setDocumentName updates name', () => {
  State.setDocumentName('notes.md');
  expect(State.getDocumentName()).toBe('notes.md');
});
test('default fileHandle is null', () => {
  expect(State.getFileHandle()).toBeNull();
});
test('setFileHandle stores handle', () => {
  const handle = { name: 'test.md' };
  State.setFileHandle(handle);
  expect(State.getFileHandle()).toBe(handle);
});
