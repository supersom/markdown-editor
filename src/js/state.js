const State = (() => {
  let _mode = 'read';
  let _content = '';
  let _isDirty = false;
  let _documentName = 'Untitled';
  let _fileHandle = null;

  return {
    reset() {
      _mode = 'read';
      _content = '';
      _isDirty = false;
      _documentName = 'Untitled';
      _fileHandle = null;
    },
    getMode() { return _mode; },
    setMode(mode) { _mode = mode; },
    getContent() { return _content; },
    setContent(text) { _content = text; },
    isDirty() { return _isDirty; },
    setDirty(dirty) { _isDirty = dirty; },
    getDocumentName() { return _documentName; },
    setDocumentName(name) { _documentName = name; },
    getFileHandle() { return _fileHandle; },
    setFileHandle(handle) { _fileHandle = handle; },
  };
})();

if (typeof module !== 'undefined') module.exports = State;
