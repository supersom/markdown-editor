const Toolbar = (() => {
  function getLineBounds(el) {
    const pos = el.selectionStart;
    const lineStart = el.value.lastIndexOf('\n', pos - 1) + 1;
    const idx = el.value.indexOf('\n', pos);
    return { lineStart, lineEnd: idx === -1 ? el.value.length : idx };
  }

  function wrapSelection(el, before, after, placeholder) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end) || placeholder;
    el.value = el.value.substring(0, start) + before + selected + after + el.value.substring(end);
    el.setSelectionRange(start + before.length, start + before.length + selected.length);
    el.dispatchEvent(new Event('input'));
  }

  function applyHeading(el) {
    const { lineStart, lineEnd } = getLineBounds(el);
    const line = el.value.substring(lineStart, lineEnd);
    let newLine;
    if (line.startsWith('### ')) newLine = line.slice(4);
    else if (line.startsWith('## ')) newLine = '### ' + line.slice(3);
    else if (line.startsWith('# ')) newLine = '## ' + line.slice(2);
    else newLine = '# ' + line;
    el.value = el.value.substring(0, lineStart) + newLine + el.value.substring(lineEnd);
    el.dispatchEvent(new Event('input'));
  }

  function applyBullet(el) {
    const { lineStart } = getLineBounds(el);
    if (el.value.substring(lineStart).startsWith('- ')) return;
    el.value = el.value.substring(0, lineStart) + '- ' + el.value.substring(lineStart);
    el.dispatchEvent(new Event('input'));
  }

  function applyNumbered(el) {
    const { lineStart } = getLineBounds(el);
    if (/^\d+\. /.test(el.value.substring(lineStart))) return;
    el.value = el.value.substring(0, lineStart) + '1. ' + el.value.substring(lineStart);
    el.dispatchEvent(new Event('input'));
  }

  return { wrapSelection, applyHeading, applyBullet, applyNumbered };
})();

if (typeof module !== 'undefined') module.exports = Toolbar;
