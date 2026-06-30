import json
import os
from typing import Any, Dict, List

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - optional until LLM features are used
    genai = None

# ---------------------------------------------------------------------------
# Difficulty resolver
# ---------------------------------------------------------------------------

def resolve_difficulty(years_experience: float | None, explicit: str | None) -> str:
    """
    If the user passed an explicit difficulty level, use it.
    Otherwise auto-detect from years_experience extracted by the Extractor Agent.
    """

    # User explicitly selected a difficulty
    if explicit in ("easy", "medium", "hard"):
        return explicit

    # Handle missing/None values safely
    if years_experience is None:
        years_experience = 0.0

    if years_experience <= 1.0:
        return "easy"
    elif years_experience <= 3.0:
        return "medium"
    else:
        return "hard"


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

DIFFICULTY_INSTRUCTIONS = {
    "easy": (
        "The candidate is a fresher or has less than 1 year of experience. "
        "Ask beginner-friendly questions: basic concept definitions, simple project walkthroughs, "
        "and behavioral questions about learning new things. Avoid deep system design."
    ),
    "medium": (
        "The candidate has 1-3 years of experience. "
        "Mix practical implementation questions with situational/behavioral ones. "
        "Include one architecture or design decision question. "
        "Expect working knowledge but not expert-level depth."
    ),
    "hard": (
        "The candidate is experienced (3+ years). "
        "Ask system design, scalability, and deep tradeoff questions. "
        "Push on edge cases, failure modes, and optimization strategies. "
        "Include at least one question that tests architectural thinking."
    ),
}

QUESTION_TYPES = {
    "easy":   ["behavioral", "conceptual", "project_walkthrough"],
    "medium": ["technical", "situational", "behavioral", "design_decision"],
    "hard":   ["system_design", "technical_depth", "tradeoff", "behavioral"],
}


def build_prompt(
    matched_skills: List[str],
    missing_skills: List[str],
    resume_summary: str,
    job_text: str,
    difficulty: str,
    score: float,
) -> str:
    difficulty_guide = DIFFICULTY_INSTRUCTIONS[difficulty]
    question_types = ", ".join(QUESTION_TYPES[difficulty])

    return f"""You are an expert technical interviewer preparing questions for a job interview.

## Candidate Profile
- Resume Summary: {resume_summary}
- Skills they have (matched): {", ".join(matched_skills) or "not specified"}
- Skills the JD requires but they lack (gaps): {", ".join(missing_skills) or "none"}
- Overall match score: {score:.0f}/100

## Job Description (excerpt)
{job_text[:1200]}

## Difficulty Level: {difficulty.upper()}
{difficulty_guide}

## Your Task
Generate exactly 12 interview questions. Use these question types for this difficulty: {question_types}.

Distribution rules:
- 4-5 questions on matched skills (probe depth, not just familiarity)
- 3-4 questions on skill gaps (assess learning ability, not just knowledge)
- 2-3 behavioral or situational questions relevant to this specific role
- 1 question about the candidate's overall background/motivation for this role

For each question return a JSON object with:
- "type": one of the question types listed above
- "skill": the skill or topic being tested (e.g. "React", "system design", "communication")
- "question": the full interview question text
- "follow_up": one follow-up probe question the interviewer can use if the answer is shallow
- "difficulty": "{difficulty}"
- "what_to_look_for": brief note on what a strong answer includes (1-2 sentences)

Return ONLY a valid JSON array of 12 objects. No markdown, no explanation, no preamble.
Example format:
[
  {{
    "type": "technical",
    "skill": "React",
    "question": "...",
    "follow_up": "...",
    "difficulty": "{difficulty}",
    "what_to_look_for": "..."
  }}
]"""


# ---------------------------------------------------------------------------
# LLM call
# ---------------------------------------------------------------------------

def _call_llm(prompt: str) -> List[Dict[str, Any]]:
    if genai is None:
        raise RuntimeError("google-generativeai is not installed")
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    response = model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


# ---------------------------------------------------------------------------
# Fallback (if LLM call fails)
# ---------------------------------------------------------------------------

def _fallback_questions(
    matched_skills: List[str],
    missing_skills: List[str],
    difficulty: str,
) -> List[Dict[str, Any]]:
    questions = []
    for skill in matched_skills[:4]:
        questions.append({
            "type": "technical",
            "skill": skill,
            "question": f"Describe a project where you used {skill}. What tradeoffs did you make?",
            "follow_up": f"What would you do differently with {skill} now?",
            "difficulty": difficulty,
            "what_to_look_for": "Concrete project example with specific decisions mentioned.",
        })
    for skill in missing_skills[:4]:
        questions.append({
            "type": "gap",
            "skill": skill,
            "question": f"This role requires {skill}. How would you get productive with it in 2 weeks?",
            "follow_up": "What resources would you use and how would you measure your progress?",
            "difficulty": difficulty,
            "what_to_look_for": "Self-awareness and a concrete learning plan.",
        })
    if not questions:
        questions.append({
            "type": "behavioral",
            "skill": "problem solving",
            "question": "Walk me through a difficult technical problem you solved end to end.",
            "follow_up": "What would you do differently?",
            "difficulty": difficulty,
            "what_to_look_for": "Structured thinking and ownership.",
        })
    while len(questions) < 12:
        questions.append({
            "type": "behavioral",
            "skill": "role fit",
            "question": "What aspects of your background make you a strong fit for this role?",
            "follow_up": "Which past project best proves that fit, and why?",
            "difficulty": difficulty,
            "what_to_look_for": "Clear connection between the candidate's experience and the role requirements.",
        })
    return questions


# ---------------------------------------------------------------------------
# Main entry — called by LangGraph node
# ---------------------------------------------------------------------------

def run_interviewer_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node function.
    Reads from state, writes { questions, events } back.
    """
    match_result = state.get("match_result", {})
    extracted_data = state.get("extracted_data", {})
    job_text = state.get("job_text", "")
    explicit_difficulty = state.get("difficulty")          # set by router from request body

    matched_skills: List[str] = match_result.get("matchedSkills", [])
    missing_skills: List[str] = match_result.get("missingSkills", [])
    score: float = match_result.get("overallScore", match_result.get("score", 0.0))
    resume_summary: str = extracted_data.get("summary", "")
    years_exp = float(extracted_data.get("years_experience") or 0.0)

    if years_exp is None:
        years_exp = 0.0

    difficulty = resolve_difficulty(years_exp, explicit_difficulty)

    try:
        prompt = build_prompt(
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            resume_summary=resume_summary,
            job_text=job_text,
            difficulty=difficulty,
            score=score,
        )
        questions = _call_llm(prompt)
    except Exception as e:
        print(f"[interviewer] LLM call failed: {e}, using fallback")
        questions = _fallback_questions(matched_skills, missing_skills, difficulty)

    events = state.get("events", [])
    events.append({"agent": "interviewer", "status": "done", "count": len(questions)})

    return {
        **state,
        "questions": questions,
        "events": events,
    }
