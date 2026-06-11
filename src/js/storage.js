const Storage = (() => {
  const KEY = 'md-editor-recovery';
  let _timer = null;

  return {
    autosave(content) {
      clearTimeout(_timer);
      _timer = setTimeout(() => localStorage.setItem(KEY, content), 500);
    },
    autosaveImmediate(content) {
      localStorage.setItem(KEY, content);
    },
    getRecovery() { return localStorage.getItem(KEY); },
    clearRecovery() { localStorage.removeItem(KEY); },
    hasRecovery() { return localStorage.getItem(KEY) !== null; },
  };
})();

if (typeof module !== 'undefined') module.exports = Storage;
