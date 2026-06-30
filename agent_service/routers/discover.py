# What this file does:
# Handles POST /discover — the job discovery endpoint.
# If the request only has resumeId (no parsedText), it fetches the resume
# text from MongoDB first, then runs the discovery pipeline.
# Returns ranked job listings as a JSON array.

from typing import Any

from fastapi import APIRouter, HTTPException

from agents.job_discovery import discover_ranked_jobs
from db.mongo import find_resume
from models.requests import DiscoverRequest
from models.responses import JobListing

router = APIRouter()


@router.post("/discover")
async def discover(payload: DiscoverRequest) -> dict[str, list[JobListing]]:
    parsed_text = payload.parsedText

    # If frontend didn't send parsedText, fetch it from MongoDB using resumeId
    if not parsed_text and payload.resumeId:
        resume = await find_resume(payload.resumeId)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        parsed_text = resume.get("parsedText", "")

    if not parsed_text:
        raise HTTPException(
            status_code=400,
            detail="Either parsedText or a valid resumeId with parsed content is required",
        )

    jobs = await discover_ranked_jobs(
        parsed_text=parsed_text,
        query=payload.query,
        location=payload.location,
        limit=payload.limit,
    )

    # Validate each job dict into JobListing and attach matchScore
    listings = []
    for job in jobs:
        listing = JobListing.model_validate(job)
        listing.matchScore = job.get("matchScore", 0.0)
        listings.append(listing)

    return {"jobs": listings}