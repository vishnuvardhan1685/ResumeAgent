from fastapi import APIRouter

from agents.job_discovery import discover_ranked_jobs
from models.requests import DiscoverRequest
from models.responses import JobListing

router = APIRouter()


@router.post("/discover")
async def discover(payload: DiscoverRequest) -> dict[str, list[JobListing]]:
    jobs = await discover_ranked_jobs(
        parsed_text=payload.parsedText,
        query=payload.query,
        location=payload.location,
        limit=payload.limit,
    )
    return {"jobs": [JobListing.model_validate(job) for job in jobs]}
