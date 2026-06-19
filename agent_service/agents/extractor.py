from models.responses import ExtractedData
from tools.nlp_tools import extract_entities, extract_skills, estimate_years_experience, summarize_text


def extract_resume_data(text: str) -> ExtractedData:
    return ExtractedData(
        skills=extract_skills(text or ""),
        entities=extract_entities(text or ""),
        years_experience=estimate_years_experience(text or ""),
        summary=summarize_text(text or ""),
    )
