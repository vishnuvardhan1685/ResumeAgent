# What this file does:
# The Job Discovery Agent is the 5th agent in the pipeline.
# It takes the candidate's resume text, builds a smart search query using
# the LLM, fetches real job listings from Google Jobs (SerpAPI) and
# Internshala, then ranks all results by semantic similarity to the resume.
# Redis caching prevents repeat API calls for the same query.

import json
import os
from typing import Any, Dict, List

import google.generativeai as genai
import redis.asyncio as aioredis

from tools.embedding_tools import rank_by_similarity
from tools.internshala_tools import search_internshala
from tools.nlp_tools import extract_skills
from tools.serpapi_tools import search_google_jobs


# ---------------------------------------------------------------------------
# Redis cache helper
# What this does: stores job results in Redis so if the same query runs
# again within 1 hour, we skip the SerpAPI + Internshala calls entirely.
# ---------------------------------------------------------------------------

def _get_redis() -> aioredis.Redis | None:
    """Returns a Redis client if REDIS_URL is configured, else None."""
    url = os.environ.get("REDIS_URL")
    if not url:
        return None
    return aioredis.from_url(url, decode_responses=True)


async def _cache_get(key: str) -> List[dict] | None:
    r = _get_redis()
    if not r:
        return None
    try:
        cached = await r.get(key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"[job_discovery] Redis get failed: {e}")
    return None


async def _cache_set(key: str, data: List[dict], ttl_seconds: int = 3600) -> None:
    """Cache results for 1 hour by default."""
    r = _get_redis()
    if not r:
        return
    try:
        await r.set(key, json.dumps(data), ex=ttl_seconds)
    except Exception as e:
        print(f"[job_discovery] Redis set failed: {e}")


# ---------------------------------------------------------------------------
# LLM-powered query builder
# What this does: instead of blindly joining skills, we ask the LLM to
# produce a natural, effective Google Jobs search query from the resume.
# Falls back to skill-join if LLM call fails.
# ---------------------------------------------------------------------------

def _build_query_fallback(parsed_text: str) -> str:
    """Simple fallback: take top 3 skills + 'developer'."""
    skills = extract_skills(parsed_text or "")
    if not skills:
        return "software developer"
    return " ".join(skills[:3]) + " developer"


def build_job_query(parsed_text: str, explicit_query: str | None = None) -> str:
    """
    If the user passed an explicit query string, use it directly.
    Otherwise ask Gemini to generate a good search query from the resume.
    Falls back to skill-join if no API key or LLM call fails.
    """
    if explicit_query:
        return explicit_query

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _build_query_fallback(parsed_text)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""You are a job search assistant.
Based on this resume text, generate a single effective Google Jobs search query (5-8 words max).
The query should reflect the candidate's primary role and top skills.
Return ONLY the search query string. No explanation, no quotes, no punctuation.

Resume text (first 800 chars):
{parsed_text[:800]}"""

        response = model.generate_content(prompt)
        query = response.text.strip().strip('"').strip("'")
        return query if query else _build_query_fallback(parsed_text)

    except Exception as e:
        print(f"[job_discovery] LLM query build failed: {e}, using fallback")
        return _build_query_fallback(parsed_text)


# ---------------------------------------------------------------------------
# Main discovery function
# What this does: orchestrates the full discovery flow —
#   1. Build smart search query
#   2. Check Redis cache
#   3. Fetch from SerpAPI + Internshala in parallel
#   4. Rank all results by semantic similarity to resume
#   5. Cache results + return top N
# ---------------------------------------------------------------------------

async def discover_ranked_jobs(
    parsed_text: str,
    query: str | None = None,
    location: str | None = None,
    limit: int = 20,
) -> List[dict]:
    import asyncio

    search_query = build_job_query(parsed_text, query)

    # Check cache before hitting external APIs
    cache_key = f"jobs:{search_query}:{location or 'any'}:{limit}"
    cached = await _cache_get(cache_key)
    if cached:
        print(f"[job_discovery] Cache hit for: {search_query}")
        # Still re-rank against this specific resume since cache is query-level
        ranked = rank_by_similarity(parsed_text, cached, "description")
        return ranked[:limit]

    # Fetch from both sources in parallel
    serp_limit = max(1, limit // 2)
    intern_limit = max(1, limit - serp_limit)

    google_jobs, internshala_jobs = await asyncio.gather(
        search_google_jobs(search_query, location, serp_limit),
        search_internshala(search_query, location, intern_limit),
    )

    jobs = google_jobs + internshala_jobs

    if not jobs:
        return []

    # Rank by semantic similarity to this resume
    ranked = rank_by_similarity(parsed_text, jobs, "description")
    result = ranked[:limit]

    # Cache the raw (unranked) jobs so future resumes can re-rank them
    await _cache_set(cache_key, jobs)

    return result


# ---------------------------------------------------------------------------
# LangGraph node entry point
# What this does: wraps discover_ranked_jobs for use as a LangGraph node.
# Reads parsed_text from pipeline state, writes discovered_jobs back.
# ---------------------------------------------------------------------------

async def run_job_discovery_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    parsed_text: str = state.get("parsed_text", "")
    query: str | None = state.get("discovery_query")
    location: str | None = state.get("discovery_location")

    try:
        jobs = await discover_ranked_jobs(
            parsed_text=parsed_text,
            query=query,
            location=location,
            limit=20,
        )
    except Exception as e:
        print(f"[job_discovery] Agent failed: {e}")
        jobs = []

    events = state.get("events", [])
    events.append({
        "agent": "job_discovery",
        "status": "done",
        "count": len(jobs),
    })

    return {
        **state,
        "discovered_jobs": jobs,
        "events": events,
    }