const State = (() => {
  let _mode = 'read';
  let _content = '';
  let _isDirty = false;
  let _documentName = 'Untitled';
  let _fileHandle = null;

  return {
    reset() {
      _mode = 'read'; _content = ''; _isDirty = false;
      _documentName = 'Untitled'; _fileHandle = null;
    },
    getMode() { return _mode; },
    setMode(m) { _mode = m; },
    getContent() { return _content; },
    setContent(t) { _content = t; },
    isDirty() { return _isDirty; },
    setDirty(d) { _isDirty = d; },
    getDocumentName() { return _documentName; },
    setDocumentName(n) { _documentName = n; },
    getFileHandle() { return _fileHandle; },
    setFileHandle(h) { _fileHandle = h; },
  };
})();

if (typeof module !== 'undefined') module.exports = State;
