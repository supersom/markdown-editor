const FileOps = (() => {
  function readFileHandle(handle) {
    return handle.getFile().then(f => f.text());
  }

  function buildMdBlob(content) {
    return new Blob([content], { type: 'text/markdown' });
  }

  function buildHtmlString(outerHtml, content) {
    const escaped = content.replace(/<\/script>/gi, '<\\/script>');
    const updated = outerHtml.replace(
      /(<script[^>]+id="md-content"[^>]*>)([\s\S]*?)(<\/script>)/,
      (_, open, _inner, close) => open + escaped + close
    );
    return '<!DOCTYPE html>\n' + updated;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function openMdFile() {
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown'] } }],
        });
        const content = await readFileHandle(handle);
        return { content, handle, name: handle.name };
      } catch (e) {
        if (e.name === 'AbortError') return null;
        throw e;
      }
    }
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return resolve(null);
        resolve({ content: await file.text(), handle: null, name: file.name });
      };
      input.click();
    });
  }

  async function saveAsHtml(content) {
    const htmlString = buildHtmlString(document.documentElement.outerHTML, content);
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'markdown-editor.html',
          types: [{ description: 'HTML file', accept: { 'text/html': ['.html'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(htmlString);
        await writable.close();
        return true;
      } catch (e) {
        if (e.name === 'AbortError') return false;
        throw e;
      }
    }
    downloadFile(htmlString, 'markdown-editor.html', 'text/html');
    return true;
  }

  async function saveAsMd(content, fileHandle, suggestedName) {
    if (fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return { savedInPlace: true };
      } catch (_) { /* fall through to dialog */ }
    }
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: suggestedName || 'document.md',
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return { savedInPlace: false, handle, name: handle.name };
      } catch (e) {
        if (e.name === 'AbortError') return null;
        throw e;
      }
    }
    downloadFile(content, suggestedName || 'document.md', 'text/markdown');
    return { savedInPlace: false };
  }

  return { readFileHandle, buildMdBlob, buildHtmlString, downloadFile, openMdFile, saveAsHtml, saveAsMd };
})();

if (typeof module !== 'undefined') module.exports = FileOps;
