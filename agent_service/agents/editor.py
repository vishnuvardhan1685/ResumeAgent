from typing import Any, Dict, List

from models.responses import MatchResult


def suggest_resume_edits(match_result: MatchResult) -> Dict[str, Any]:
    suggestions: List[Dict[str, str]] = []
    for skill in match_result.missingSkills[:6]:
        suggestions.append(
            {
                "section": "skills_or_experience",
                "priority": "high",
                "suggestion": f"Add a concrete bullet showing exposure to {skill}, if you have real experience with it.",
            }
        )
    for skill in match_result.matchedSkills[:4]:
        suggestions.append(
            {
                "section": "experience",
                "priority": "medium",
                "suggestion": f"Quantify an achievement where {skill} contributed to the outcome.",
            }
        )
    return {
        "summary": "Focus the resume on role keywords, measurable outcomes, and direct evidence for missing skills.",
        "items": suggestions,
    }
