const Storage = require('../src/js/storage');

beforeEach(() => localStorage.clear());

test('getRecovery returns null when nothing saved', () => {
  expect(Storage.getRecovery()).toBeNull();
});
test('autosaveImmediate stores content', () => {
  Storage.autosaveImmediate('# Hello');
  expect(Storage.getRecovery()).toBe('# Hello');
});
test('clearRecovery removes stored content', () => {
  Storage.autosaveImmediate('# Hello');
  Storage.clearRecovery();
  expect(Storage.getRecovery()).toBeNull();
});
test('clearRecovery cancels pending debounced autosave', () => {
  jest.useFakeTimers();
  Storage.autosave('draft content');
  Storage.clearRecovery();
  jest.runAllTimers();
  expect(Storage.getRecovery()).toBeNull();
  jest.useRealTimers();
});
test('hasRecovery false when empty', () => {
  expect(Storage.hasRecovery()).toBe(false);
});
test('hasRecovery true after save', () => {
  Storage.autosaveImmediate('content');
  expect(Storage.hasRecovery()).toBe(true);
});
