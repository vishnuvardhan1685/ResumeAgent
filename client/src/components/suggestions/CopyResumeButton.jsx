import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Takes the original resume text and applies all accepted rewrites,
 * then copies to clipboard.
 *
 * @param {string} originalText - parsedText from Resume model
 * @param {{ original: string, rewritten: string }[]} suggestions
 * @param {string} summaryRewrite - optional new summary from Editor Agent
 */
const CopyResumeButton = ({ originalText = '', suggestions = [], summaryRewrite }) => {
  const [copied, setCopied] = useState(false);

  const assemble = () => {
    let result = originalText;
    // Apply each rewrite by simple string replacement
    for (const s of suggestions) {
      if (s.original && s.rewritten) {
        result = result.replace(s.original, s.rewritten);
      }
    }
    // Prepend summary rewrite if provided
    if (summaryRewrite) {
      result = summaryRewrite + '\n\n' + result;
    }
    return result;
  };

  const handleCopy = async () => {
    const text = assemble();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Button
      variant={copied ? 'secondary' : 'primary'}
      size="md"
      icon={copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      onClick={handleCopy}
    >
      {copied ? 'Copied to clipboard' : 'Copy rewritten resume'}
    </Button>
  );
};

export default CopyResumeButton;
