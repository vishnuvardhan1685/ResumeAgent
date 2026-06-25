from typing import List

import httpx

from config import get_settings


async def search_google_jobs(query: str, location: str | None = None, limit: int = 10) -> List[dict]:
    settings = get_settings()
    if not settings.serpapi_key:
        return []

    params = {
        "engine": "google_jobs",
        "q": query,
        "api_key": settings.serpapi_key,
    }
    if location:
        params["location"] = location

    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
        response = await client.get("https://serpapi.com/search.json", params=params)
        response.raise_for_status()
        payload = response.json()

    jobs = []
    for item in payload.get("jobs_results", [])[:limit]:
        apply_options = item.get("apply_options") or []
        jobs.append(
            {
                "title": item.get("title") or "Untitled role",
                "company": item.get("company_name") or "Unknown company",
                "location": item.get("location"),
                "description": item.get("description"),
                "applyLink": apply_options[0].get("link") if apply_options else item.get("share_link"),
                "source": "google_jobs",
            }
        )
    return jobs
