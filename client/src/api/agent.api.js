import useAuthStore from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const toUiResult = (payload) => {
  const match = payload.match_result ?? payload.matchResult ?? {};
  const editor = payload.suggestions ?? {};
  const items = editor.suggestions ?? editor.items ?? [];
  return {
    overall_score: match.overall_score ?? match.overallScore ?? 0,
    semantic_similarity: match.semantic_similarity ?? match.semanticSimilarity ?? 0,
    skill_match_pct: match.skill_match_pct ?? match.skillMatchPct ?? 0,
    matched_skills: match.matched_skills ?? match.matchedSkills ?? [],
    missing_skills: match.missing_skills ?? match.missingSkills ?? [],
    bonus_skills: match.bonus_skills ?? match.bonusSkills ?? [],
    strength_areas: match.strength_areas ?? match.strengthAreas ?? [],
    gap_areas: match.gap_areas ?? match.gapAreas ?? [],
    interview_questions: payload.interview_questions ?? payload.questions ?? [],
    suggestions: {
      suggestions: items.map((item) => ({
        original: item.original ?? item.section ?? '',
        rewritten: item.rewritten ?? item.suggestion ?? '',
        reason: item.reason ?? item.priority ?? '',
      })),
      missing_sections: editor.missing_sections ?? [],
      summary_rewrite: editor.summary_rewrite ?? editor.summary ?? '',
    },
    match_result_id: payload.matchResultId ?? null,
  };
};

const parseEventBlock = (block) => {
  let event = 'message';
  const data = [];
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  return { event, data: JSON.parse(data.join('\n')) };
};

export const streamAnalysis = async ({ resumeId, jobId, onEvent }) => {
  const token = useAuthStore.getState().accessToken;
  const response = await fetch(`${API_BASE}/api/agent/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ resumeId, jobId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Analysis failed (${response.status})`);
  }
  if (!response.body) throw new Error('Streaming is not supported by this browser.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult = null;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? '';
    for (const block of blocks) {
      if (!block.trim()) continue;
      const message = parseEventBlock(block);
      if (!message) continue;
      if (message.event === 'error') throw new Error(message.data.message ?? 'Pipeline failed');
      if (message.event === 'complete') {
        finalResult = toUiResult(message.data);
        onEvent?.({ event: 'complete', data: finalResult });
      } else onEvent?.(message);
    }
    if (done) break;
  }
  if (!finalResult) throw new Error('Pipeline ended without a result.');
  return finalResult;
};
