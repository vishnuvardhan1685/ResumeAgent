/**
 * assembleFinalResume
 *
 * Takes the original resume plain text and applies all accepted bullet rewrites,
 * then prepends the summary rewrite if provided.
 *
 * @param {string} originalText       - Resume.parsedText from the backend
 * @param {{ original: string, rewritten: string }[]} suggestions
 * @param {string} [summaryRewrite]   - Optional new professional summary
 * @returns {string}
 */
export const assembleFinalResume = (originalText = '', suggestions = [], summaryRewrite) => {
  let result = originalText;

  // Apply each bullet rewrite via string replacement
  for (const { original, rewritten } of suggestions) {
    if (original && rewritten) {
      // Replace only the first occurrence to avoid unintended replacements
      result = result.replace(original, rewritten);
    }
  }

  if (summaryRewrite) {
    // Insert the new summary at the top, before the existing text
    result = summaryRewrite + '\n\n' + result;
  }

  return result;
};

/**
 * copyToClipboard — simple utility used by CopyResumeButton
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};