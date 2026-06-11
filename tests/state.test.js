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
test('reset() restores all defaults after mutation', () => {
  State.setMode('edit');
  State.setContent('# Hello');
  State.setDirty(true);
  State.setDocumentName('notes.md');
  State.setFileHandle({ name: 'notes.md' });
  State.reset();
  expect(State.getMode()).toBe('read');
  expect(State.getContent()).toBe('');
  expect(State.isDirty()).toBe(false);
  expect(State.getDocumentName()).toBe('Untitled');
  expect(State.getFileHandle()).toBeNull();
});
test('setDirty false clears dirty state', () => {
  State.setDirty(true);
  State.setDirty(false);
  expect(State.isDirty()).toBe(false);
});
test('setFileHandle null clears handle', () => {
  State.setFileHandle({ name: 'test.md' });
  State.setFileHandle(null);
  expect(State.getFileHandle()).toBeNull();
});
