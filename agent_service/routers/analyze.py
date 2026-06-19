import json
from datetime import datetime, timezone
from typing import Any, AsyncIterator

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from db.mongo import find_job_text, find_resume, save_match_result
from db.mongo import update_job_embedding_id
from db.postgres import upsert_job_embedding
from graph import run_pipeline
from models.requests import AnalyzeRequest, EmbedJobRequest
from tools.embedding_tools import embed_text

router = APIRouter()


def _sse(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"


def _text_from_job(job: dict[str, Any] | None) -> str:
    if not job:
        return ""
    return job.get("jdText") or job.get("description") or " ".join(
        str(job.get(key) or "") for key in ("title", "company", "location")
    )


async def _resolve_inputs(payload: AnalyzeRequest) -> tuple[str, str, dict[str, Any] | None, dict[str, Any] | None]:
    resume = await find_resume(payload.resumeId)
    job = await find_job_text(payload.jobId)
    parsed_text = payload.parsedText or (resume or {}).get("parsedText") or ""
    job_text = payload.jdText or _text_from_job(job)
    if not parsed_text:
        raise HTTPException(status_code=404, detail="Resume text not found")
    if not job_text:
        raise HTTPException(status_code=404, detail="Job text not found")
    return parsed_text, job_text, resume, job


@router.post("/analyze")
async def analyze(payload: AnalyzeRequest) -> StreamingResponse:
    parsed_text, job_text, resume, _job = await _resolve_inputs(payload)

    async def stream() -> AsyncIterator[str]:
        yield _sse("status", {"stage": "started", "message": "Pipeline started"})
        result = await run_pipeline(
            {
                "resume_id": payload.resumeId,
                "job_id": payload.jobId,
                "parsed_text": parsed_text,
                "job_text": job_text,
                "events": [],
            }
        )

        for event in result.get("events", []):
            yield _sse(event["event"], event["data"])

        match_result = result.get("match_result", {})
        match_doc = {
            "userId": resume.get("userId") if resume else None,
            "resumeId": ObjectId(payload.resumeId),
            "jobId": ObjectId(payload.jobId),
            "overallScore": match_result.get("overallScore"),
            "semanticSimilarity": match_result.get("semanticSimilarity"),
            "skillMatchPct": match_result.get("skillMatchPct"),
            "matchedSkills": match_result.get("matchedSkills", []),
            "missingSkills": match_result.get("missingSkills", []),
            "bonusSkills": match_result.get("bonusSkills", []),
            "strengthAreas": match_result.get("strengthAreas", []),
            "gapAreas": match_result.get("gapAreas", []),
            "questions": result.get("questions", []),
            "suggestions": result.get("suggestions", {}),
            "createdAt": datetime.now(timezone.utc),
        }
        if match_doc["userId"] is not None:
            match_id = await save_match_result(match_doc)
            result["matchResultId"] = match_id

        yield _sse("complete", result)

    return StreamingResponse(stream(), media_type="text/event-stream")


@router.post("/embed-jd")
async def embed_jd(payload: EmbedJobRequest) -> dict[str, Any]:
    embedding = embed_text(payload.jdText)
    pgvector_id = await upsert_job_embedding(payload.jobId, payload.jdText, embedding)
    if pgvector_id is not None:
        await update_job_embedding_id(payload.jobId, pgvector_id)
    return {"ok": True, "jobId": payload.jobId, "pgvectorId": pgvector_id}
