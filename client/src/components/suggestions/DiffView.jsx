import React from 'react';

/**
 * Simple word-diff: compares two strings word by word.
 * Returns an array of tokens: { word, type: 'same' | 'removed' | 'added' }
 */
const wordDiff = (original, rewritten) => {
  const origWords = original.trim().split(/\s+/);
  const newWords = rewritten.trim().split(/\s+/);

  // LCS-based diff (simple O(n²) for short strings like bullet points)
  const m = origWords.length;
  const n = newWords.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        origWords[i - 1] === newWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to build diff tokens
  let i = m, j = n;
  const backtrack = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === newWords[j - 1]) {
      backtrack.push({ word: origWords[i - 1], type: 'same' });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      backtrack.push({ word: newWords[j - 1], type: 'added' });
      j--;
    } else {
      backtrack.push({ word: origWords[i - 1], type: 'removed' });
      i--;
    }
  }
  return backtrack.reverse();
};

const DiffView = ({ original, rewritten }) => {
  const tokens = wordDiff(original, rewritten);

  const renderTokens = (tokens, side) =>
    tokens
      .filter((t) => side === 'original' ? t.type !== 'added' : t.type !== 'removed')
      .map((t, i) => {
        if (t.type === 'same') return <span key={i}>{t.word} </span>;
        if (side === 'original' && t.type === 'removed')
          return (
            <span key={i} className="line-through text-red-400 bg-red-500/10 px-0.5 rounded">
              {t.word}{' '}
            </span>
          );
        if (side === 'rewritten' && t.type === 'added')
          return (
            <span key={i} className="text-emerald-400 bg-emerald-500/10 px-0.5 rounded">
              {t.word}{' '}
            </span>
          );
        return <span key={i}>{t.word} </span>;
      });

  return (
    <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
      <div>
        <p className="text-2xs font-mono uppercase tracking-widest text-red-400 mb-2">Original</p>
        <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 text-text-secondary">
          {renderTokens(tokens, 'original')}
        </div>
      </div>
      <div>
        <p className="text-2xs font-mono uppercase tracking-widest text-emerald-400 mb-2">Rewritten</p>
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3 text-text-secondary">
          {renderTokens(tokens, 'rewritten')}
        </div>
      </div>
    </div>
  );
};

export default DiffView;
