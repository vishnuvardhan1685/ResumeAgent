from typing import List

from tools.embedding_tools import rank_by_similarity
from tools.internshala_tools import search_internshala
from tools.nlp_tools import extract_skills
from tools.serpapi_tools import search_google_jobs


def build_job_query(parsed_text: str, explicit_query: str | None = None) -> str:
    if explicit_query:
        return explicit_query
    skills = extract_skills(parsed_text or "")
    if not skills:
        return "software developer"
    return " ".join(skills[:4]) + " developer"


async def discover_ranked_jobs(
    parsed_text: str,
    query: str | None = None,
    location: str | None = None,
    limit: int = 20,
) -> List[dict]:
    search_query = build_job_query(parsed_text, query)
    serp_limit = max(1, limit // 2)
    intern_limit = max(1, limit - serp_limit)

    google_jobs = await search_google_jobs(search_query, location, serp_limit)
    internshala_jobs = await search_internshala(search_query, location, intern_limit)
    jobs = google_jobs + internshala_jobs

    if not jobs:
        return []

    ranked = rank_by_similarity(parsed_text, jobs, "description")
    return ranked[:limit]
