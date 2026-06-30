import json
import os
from typing import Any, Dict, List
from config import get_settings

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - optional until LLM features are used
    genai = None

# ---------------------------------------------------------------------------
# What this file does:
# The Editor Agent reads the candidate's actual resume text and the job
# description, then uses an LLM to produce two things:
#   1. Rewrites of existing weak bullets to better match the JD
#   2. Suggestions for new bullets covering skills the JD needs but the
#      resume doesn't show
# Everything is specific and copy-pasteable — not generic advice.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Prompt builder
# What this does: constructs the full instruction we send to the LLM.
# We give it the resume, the JD, and the skill gap so it has full context.
# ---------------------------------------------------------------------------

def build_editor_prompt(
    resume_text: str,
    job_text: str,
    matched_skills: List[str],
    missing_skills: List[str],
    score: float,
) -> str:
    return f"""You are an expert resume coach and technical recruiter.
Your job is to suggest specific, copy-pasteable improvements to a candidate's resume
so it better matches a target job description.

## Candidate's Current Resume
{resume_text[:2000]}

## Target Job Description
{job_text[:1500]}

## Analysis Context
- Current match score: {score:.0f}/100
- Skills candidate already has: {", ".join(matched_skills) or "none identified"}
- Skills the JD needs but resume lacks: {", ".join(missing_skills) or "none"}

## Your Task
Produce exactly 10 resume improvement suggestions. Mix of:
- 4-5 rewrites of existing bullets (make them stronger, more specific, JD-aligned)
- 3-4 new bullet suggestions for missing skills (only if candidate plausibly has experience)
- 1-2 structural suggestions (summary rewrite, skills section reorder, etc.)

For each suggestion return a JSON object with:
- "section": where it goes — "experience" | "skills" | "projects" | "summary"
- "priority": "high" | "medium" | "low"
- "type": "rewrite" | "new_bullet" | "remove" | "reorder"
- "original": the existing text being replaced (copy exact text from resume, or null for new bullets)
- "suggested": the improved bullet or text (specific, concrete, starts with action verb)
- "reason": one sentence — why this change helps match this specific JD
- "skill_addressed": the skill or keyword this targets (e.g. "Docker", "system design")

Rules for good bullets:
- Start with a strong action verb (Built, Designed, Reduced, Led, Implemented)
- Include a metric where possible (e.g. "reduced load time by 40%")
- Mirror keywords from the JD naturally — don't stuff keywords awkwardly
- Keep each bullet under 2 lines

Also return:
- "summary": one sentence of overall strategic advice for this resume+JD combo
- "priority_skills": list of exactly 3 skills the candidate should highlight most urgently

Return ONLY a valid JSON object. No markdown, no explanation, no preamble.
Format:
{{
  "summary": "...",
  "priority_skills": ["skill1", "skill2", "skill3"],
  "items": [
    {{
      "section": "experience",
      "priority": "high",
      "type": "rewrite",
      "original": "exact text from resume or null",
      "suggested": "improved bullet text",
      "reason": "...",
      "skill_addressed": "..."
    }}
  ]
}}"""


# ---------------------------------------------------------------------------
# LLM call
# What this does: sends the prompt to Gemini Flash and parses the JSON back.
# Falls back to template suggestions if the API call fails for any reason.
# ---------------------------------------------------------------------------

def _call_llm(prompt: str) -> Dict[str, Any]:
    if genai is None:
        raise RuntimeError("google-generativeai is not installed")
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown fences if Gemini wraps the response in ```json ... ```
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


# ---------------------------------------------------------------------------
# Fallback
# What this does: if the LLM call fails (no API key, rate limit, bad JSON),
# we still return something useful using simple template logic — same as the
# old stub but now in the correct typed format.
# ---------------------------------------------------------------------------

def _fallback_suggestions(
    matched_skills: List[str],
    missing_skills: List[str],
) -> Dict[str, Any]:
    items = []
    priority_skills = (missing_skills + matched_skills + ["communication", "problem solving", "role fit"])[:3]

    for skill in missing_skills[:5]:
        items.append({
            "section": "experience",
            "priority": "high",
            "type": "new_bullet",
            "original": None,
            "suggested": f"Implemented {skill} to solve [specific problem], resulting in [measurable outcome].",
            "reason": f"JD explicitly requires {skill} but it's not demonstrated in the resume.",
            "skill_addressed": skill,
        })

    for skill in matched_skills[:4]:
        items.append({
            "section": "experience",
            "priority": "medium",
            "type": "rewrite",
            "original": None,
            "suggested": f"Leveraged {skill} to deliver [specific feature/outcome], improving [metric] by X%.",
            "reason": f"Existing {skill} experience needs quantified outcomes to stand out.",
            "skill_addressed": skill,
        })

    return {
        "summary": "Focus on quantified outcomes and direct evidence for the JD's key requirements.",
        "priority_skills": priority_skills,
        "items": items,
    }


# ---------------------------------------------------------------------------
# Main entry point — called by LangGraph node
# What this does: reads from the pipeline state, calls the LLM, and writes
# the suggestions back into state so the next node or the API response
# can use them.
# ---------------------------------------------------------------------------

def run_editor_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    resume_text: str = state.get("parsed_text", "")
    job_text: str = state.get("job_text", "")
    match_result: Dict = state.get("match_result", {})
    
    matched_skills: List[str] = match_result.get("matchedSkills", [])
    missing_skills: List[str] = match_result.get("missingSkills", [])
    score: float = match_result.get("overallScore", 0.0)

    try:
        prompt = build_editor_prompt(
            resume_text=resume_text,
            job_text=job_text,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            score=score,
        )
        raw_result = _call_llm(prompt)

        # Validate the structure we got back has what we need
        if "items" not in raw_result:
            raise ValueError("LLM response missing 'items' key")

    except Exception as e:
        print(f"[editor] LLM call failed: {e}, using fallback")
        raw_result = _fallback_suggestions(matched_skills, missing_skills)

    events = state.get("events", [])
    events.append({
        "agent": "editor",
        "status": "done",
        "count": len(raw_result.get("items", [])),
    })

    return {
        **state,
        "suggestions": raw_result,
        "events": events,
    }
