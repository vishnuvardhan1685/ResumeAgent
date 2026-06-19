from agents.extractor import extract_resume_data
from agents.matcher import match_resume_to_job


def test_matcher_scores_skill_overlap():
    resume = "Python React MongoDB developer"
    job = "Looking for Python and React experience"
    extracted = extract_resume_data(resume)

    result = match_resume_to_job(resume, job, extracted)

    assert "Python" in result.matchedSkills
    assert "React" in result.matchedSkills
    assert result.skillMatchPct > 0
