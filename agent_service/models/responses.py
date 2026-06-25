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
    matchScore: float = 0


class ParseResponse(BaseModel):
    parsedText: str
    extractedData: ExtractedData | None = None


class AnalyzeResponse(BaseModel):
    extractedData: ExtractedData
    matchResult: MatchResult
    questions: List[Dict[str, Any]]
    suggestions: Dict[str, Any]
