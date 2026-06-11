// IIFE pattern matches all other modules so `Markdown` is accessible in the
// shared script scope after the build concatenates all src/js/*.js files.
const Markdown = (() => {
  const _marked = typeof marked !== 'undefined' ? marked : require('marked');

  function renderMarkdown(text) {
    if (!text || text.trim() === '') return '';
    return _marked.parse(text);
  }

  return { renderMarkdown };
})();

if (typeof module !== 'undefined') module.exports = Markdown;
