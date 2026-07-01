import json
import os
from typing import Any, Dict, List
from config import get_settings

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
    resume_text: str,
    job_text: str,
    difficulty: str,
    score: float,
) -> str:
    difficulty_guide = DIFFICULTY_INSTRUCTIONS[difficulty]
    question_types = ", ".join(QUESTION_TYPES[difficulty])

    return f"""
You are a Senior Software Engineer and Hiring Manager at a top-tier product company such as Google, Microsoft, Meta, Atlassian, or Amazon.

You are conducting a real technical interview for the position described below.

Your responsibility is NOT to test textbook knowledge.

Your responsibility is to determine whether the candidate genuinely built the projects listed on the resume and whether they can perform well in this role.

Assume the candidate may have exaggerated parts of the resume. Your questions should expose real understanding, engineering maturity, design thinking, debugging ability, and practical experience.

--------------------------------------------------
CANDIDATE RESUME
--------------------------------------------------

{resume_text[:3500]}

--------------------------------------------------
MATCH ANALYSIS
--------------------------------------------------

Overall Match Score:
{score:.0f}/100

Matched Skills:
{", ".join(matched_skills) or "Not identified"}

Missing Skills:
{", ".join(missing_skills) or "None"}

--------------------------------------------------
JOB DESCRIPTION
--------------------------------------------------

{job_text[:1800]}

--------------------------------------------------
INTERVIEW DIFFICULTY
--------------------------------------------------

Difficulty:
{difficulty.upper()}

{difficulty_guide}

--------------------------------------------------
INTERVIEW OBJECTIVES
--------------------------------------------------

Evaluate the candidate's:

• Technical depth
• Engineering decisions
• Problem-solving ability
• Debugging skills
• Production awareness
• System design thinking
• Communication
• Learning ability
• Role fit

--------------------------------------------------
QUESTION DISTRIBUTION
--------------------------------------------------

Generate EXACTLY 12 questions.

The distribution MUST be:

1. Resume Deep Dive (3)
   - Ask about actual projects from the resume.
   - Verify whether the candidate genuinely built them.
   - Ask implementation details.
   - Ask why specific technologies were chosen.

2. Architecture & Design (3)
   - System design decisions
   - Scalability
   - Tradeoffs
   - Database choices
   - API design
   - Performance

3. Debugging & Production (2)
   - Failure scenarios
   - Edge cases
   - Bottlenecks
   - Monitoring
   - Logging
   - Recovery

4. Skill Gap (2)
   - Focus ONLY on missing skills.
   - Ask how the candidate would learn or apply them.
   - Do NOT ask definition-based questions.

5. Behavioural (1)
   - Based on actual resume experiences.
   - Example:
     leadership,
     hackathons,
     internships,
     teamwork,
     project ownership.

6. Career Motivation (1)
   - Why this role?
   - Why this company?
   - Why this domain?

--------------------------------------------------
VERY IMPORTANT RULES
--------------------------------------------------

Every technical question MUST reference at least ONE of:

• a project
• a technology
• a design decision
• a metric
• a challenge
• a tradeoff

mentioned in either the resume or the job description.

Questions should progressively become harder.

Question #1 should be straightforward.

Question #12 should be the most challenging.

Avoid repeating the same question pattern.

Avoid asking multiple questions that test the same concept.

--------------------------------------------------
FORBIDDEN QUESTIONS
--------------------------------------------------

Never ask:

"What is React?"

"What is Java?"

"What is Node.js?"

"Explain Python."

"Tell me about yourself."

"What are your strengths?"

"What are your weaknesses?"

"Why should we hire you?"

"What is OOP?"

"Define REST."

These are generic interview questions and are NOT acceptable.

--------------------------------------------------
GOOD QUESTION EXAMPLES
--------------------------------------------------

Instead of:

"What is LangGraph?"

Ask:

"I noticed you built ResumeAgent using LangGraph.

Why did you choose LangGraph over CrewAI or AutoGen?

How did you manage state sharing between your agents?

If one agent failed midway, how would you recover?"

--------------------------------------------------

Instead of:

"What is PostgreSQL?"

Ask:

"Your IoT dashboard stores telemetry in TimescaleDB.

Why did you choose TimescaleDB instead of MongoDB?

How would your schema change if data volume increased to 100 million records?"

--------------------------------------------------

Instead of:

"What is React?"

Ask:

"Your PubliShelf project supports live auctions.

How did you synchronize bids between multiple users?

How would you prevent race conditions?"

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Return ONLY a valid JSON array.

No markdown.

No explanation.

No comments.

No code fences.

Each object MUST have the following schema:

[
  {{
    "type": "resume_deep_dive | architecture | debugging | skill_gap | behavioural | career",
    "project": "Project name or null",
    "skill": "Primary skill being tested",
    "question": "Complete interview question",
    "follow_up": "A deeper follow-up question",
    "difficulty": "{difficulty}",
    "expected_topics": [
      "topic 1",
      "topic 2",
      "topic 3"
    ],
    "what_to_look_for": "What an interviewer should expect from a strong answer."
  }}
]

Generate exactly 12 unique questions.

Do not repeat question templates.

Make the interview feel like one conducted by a Senior Engineer at a top product company.
"""

# ---------------------------------------------------------------------------
# LLM call
# ---------------------------------------------------------------------------

import traceback

from config import get_settings

from config import get_settings

def _call_llm(prompt: str) -> List[Dict[str, Any]]:
    if genai is None:
        raise RuntimeError("google-generativeai is not installed")

    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")

    response = model.generate_content(prompt)
    print("=" * 80)
    print("RAW GEMINI RESPONSE")
    print("=" * 80)

    print(response)

    print("=" * 80)

    if not hasattr(response, "text") or not response.text:
        raise RuntimeError(f"Gemini returned an empty response:\n{response}")

    raw = response.text.strip()

    print("\n================ GEMINI RAW RESPONSE ================\n")
    print(raw)
    print("\n=====================================================\n")

    # Remove markdown fences if Gemini returns ```json ... ```
    if raw.startswith("```"):
        raw = raw.strip()

        if raw.startswith("```json"):
            raw = raw[len("```json"):].strip()

        elif raw.startswith("```"):
            raw = raw[len("```"):].strip()

        if raw.endswith("```"):
            raw = raw[:-3].strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print("\n=========== INVALID JSON FROM GEMINI ===========\n")
        print(raw)
        print("\n===============================================\n")
        raise

    if not isinstance(data, list):
        raise RuntimeError(
            f"Expected a JSON array but got {type(data).__name__}"
        )

    if len(data) != 12:
        print(f"Warning: Gemini returned {len(data)} questions instead of 12.")

    return data


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
    resume_text = state.get("parsed_text", "")
    years_exp = float(extracted_data.get("years_experience") or 0.0)

    if years_exp is None:
        years_exp = 0.0

    difficulty = resolve_difficulty(years_exp, explicit_difficulty)

    try:
        prompt = build_prompt(
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            resume_text=resume_text,
            job_text=job_text,
            difficulty=difficulty,
            score=score,
        )

        questions = _call_llm(prompt)

    except Exception:
        print("\n========== INTERVIEWER AGENT FAILED ==========\n")
        traceback.print_exc()
        print("\n==============================================\n")

        print("[interviewer] Falling back to template questions...\n")

        questions = _fallback_questions(
            matched_skills,
            missing_skills,
            difficulty,
        )

    events = state.get("events", [])
    events.append({"agent": "interviewer", "status": "done", "count": len(questions)})

    return {
        **state,
        "questions": questions,
        "events": events,
    }
