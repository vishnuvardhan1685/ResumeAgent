from typing import Dict, List

from models.responses import MatchResult


def generate_interview_questions(match_result: MatchResult, job_text: str = "") -> List[Dict[str, str]]:
    questions: List[Dict[str, str]] = []
    for skill in match_result.matchedSkills[:4]:
        questions.append(
            {
                "type": "technical",
                "skill": skill,
                "question": f"Describe a project where you used {skill}. What tradeoffs did you make?",
            }
        )
    for skill in match_result.missingSkills[:4]:
        questions.append(
            {
                "type": "gap",
                "skill": skill,
                "question": f"This role mentions {skill}. How would you get productive with it quickly?",
            }
        )
    if not questions:
        questions.append(
            {
                "type": "behavioral",
                "skill": "problem solving",
                "question": "Walk me through a difficult technical problem you solved end to end.",
            }
        )
    return questions
