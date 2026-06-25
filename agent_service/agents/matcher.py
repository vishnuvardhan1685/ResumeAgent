from models.responses import ExtractedData, MatchResult
from tools.embedding_tools import cosine_similarity, embed_text
from tools.nlp_tools import extract_skills


def match_resume_to_job(resume_text: str, job_text: str, extracted_data: ExtractedData | None = None) -> MatchResult:
    resume_skills = set((extracted_data.skills if extracted_data else extract_skills(resume_text)) or [])
    job_skills = set(extract_skills(job_text or ""))

    matched = sorted(resume_skills & job_skills, key=str.lower)
    missing = sorted(job_skills - resume_skills, key=str.lower)
    bonus = sorted(resume_skills - job_skills, key=str.lower)

    semantic = cosine_similarity(embed_text(resume_text or ""), embed_text(job_text or ""))
    skill_match = len(matched) / len(job_skills) if job_skills else (1 if resume_skills else 0)
    overall = (semantic * 0.55) + (skill_match * 0.45)

    strengths = [f"Strong alignment on {skill}" for skill in matched[:5]]
    gaps = [f"Add more evidence for {skill}" for skill in missing[:5]]

    return MatchResult(
        
        overallScore=round(overall * 100, 2),
        semanticSimilarity=round(semantic * 100, 2),
        skillMatchPct=round(skill_match * 100, 2),
        matchedSkills=matched,
        missingSkills=missing,
        bonusSkills=bonus,
        strengthAreas=strengths,
        gapAreas=gaps,
    )

 