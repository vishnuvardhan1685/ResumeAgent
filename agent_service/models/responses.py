from typing import Any, Dict, List

from pydantic import BaseModel, Field

class ExtractedData(BaseModel):
    skills: List[str] = Field(default_factory=list)
    entities: Dict[str, List[str]] = Field(default_factory=dict)
    years_experience: float | None = None
    summary: str = ""


class MatchResult(BaseModel):
    overallScore: float = 0
    semanticSimilarity: float = 0
    skillMatchPct: float = 0
    matchedSkills: List[str] = Field(default_factory=list)
    missingSkills: List[str] = Field(default_factory=list)
    bonusSkills: List[str] = Field(default_factory=list)
    strengthAreas: List[str] = Field(default_factory=list)
    gapAreas: List[str] = Field(default_factory=list)


class JobListing(BaseModel):
    title: str
    company: str
    location: str | None = None
    description: str | None = None
    applyLink: str | None = None
    source: str
    matchScore: float = 0.0      # populated by rank_by_similarity


class ParseResponse(BaseModel):
    parsedText: str
    extractedData: ExtractedData | None = None


class ResumeSuggestionItem(BaseModel):
    section: str                    # "experience", "skills", "projects", "summary"
    priority: str                   # "high", "medium", "low"
    type: str                       # "rewrite" | "new_bullet" | "remove" | "reorder"
    original: str | None = None     # the existing bullet being rewritten (if any)
    suggested: str                  # the new bullet text
    reason: str                     # why this change helps match the JD
    skill_addressed: str            # which skill/keyword this targets


class SuggestionsResponse(BaseModel):
    summary: str                                    # one-line overall advice
    items: List[ResumeSuggestionItem]               # all individual suggestions
    priority_skills: List[str]                      # top 3 skills to highlight immediately


class AnalyzeResponse(BaseModel):
    extractedData: ExtractedData
    matchResult: MatchResult
    questions: List[Dict[str, Any]]
    suggestions: SuggestionsResponse
