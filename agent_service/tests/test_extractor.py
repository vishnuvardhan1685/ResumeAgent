from agents.extractor import extract_resume_data


def test_extract_resume_data_finds_skills():
    result = extract_resume_data("Built React and FastAPI services with PostgreSQL. 3 years experience.")

    assert "React" in result.skills
    assert "Fastapi" in result.skills
    assert "PostgreSQL" in result.skills
    assert result.years_experience == 3
