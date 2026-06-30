import json
import asyncio
from datetime import datetime, timezone
from typing import Any, AsyncIterator

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from db.mongo import find_job_text, find_resume, save_match_result
from db.mongo import update_job_embedding_id
from db.postgres import upsert_job_embedding
from graph import extraction_node, matcher_node, interviewer_node, editor_node
from models.requests import AnalyzeRequest, EmbedJobRequest
from tools.embedding_tools import embed_text
from config import get_settings
import traceback

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
    print("Entering resolve_inputs")
    resume = None
    job = None
    if payload.parsedText:
        parsed_text = payload.parsedText
    else:
        print("Calling find_resume")
        resume = await find_resume(payload.resumeId)
        print("Resume returned:", resume)
        parsed_text = (resume or {}).get("parsedText") or ""
    if payload.jdText:
        job_text = payload.jdText
    else:
        print("Calling find_job_text...")
        job = await find_job_text(payload.jobId)
        print("Job returned:", job)
        job_text = _text_from_job(job)
    if not parsed_text:
        raise HTTPException(status_code=404, detail="Resume text not found")
    if not job_text:
        raise HTTPException(status_code=404, detail="Job text not found")
    return parsed_text, job_text, resume, job


@router.post("/analyze")
async def analyze(payload: AnalyzeRequest) -> StreamingResponse:
    print("Analyze endpoint hit!")
    settings = get_settings()
    print("Mongo URI:", settings.mongo_uri)
    print("Mongo DB Name:", settings.mongo_db_name)
    print(payload)

    parsed_text, job_text, resume, _job = await _resolve_inputs(payload)

    async def stream() -> AsyncIterator[str]:
        state = {
                "resume_id": payload.resumeId,
                "job_id": payload.jobId,
                "parsed_text": parsed_text,
                "job_text": job_text,
                "difficulty": payload.difficulty,
                "events": [],
        }
        try:
            yield _sse("status", {"agentName": "extractor", "status": "running", "message": "Reading resume"})
            state = await asyncio.to_thread(extraction_node, state)
            yield _sse("extractor", {"agentName": "extractor", "status": "done", "message": "Resume parsed"})

            yield _sse("status", {"agentName": "matcher", "status": "running", "message": "Comparing resume and job"})
            state = await asyncio.to_thread(matcher_node, state)
            yield _sse("matcher", {"agentName": "matcher", "status": "done", "message": "Match scored"})

            yield _sse("status", {"agentName": "interviewer", "status": "running", "message": "Generating questions"})
            yield _sse("status", {"agentName": "editor", "status": "running", "message": "Writing improvements"})
            interview_state, editor_state = await asyncio.gather(
                asyncio.to_thread(interviewer_node, state),
                asyncio.to_thread(editor_node, state),
            )
            state = {
                **state,
                "questions": interview_state.get("questions", []),
                "suggestions": editor_state.get("suggestions", {}),
            }
            yield _sse("interviewer", {"agentName": "interviewer", "status": "done", "message": "Questions ready"})
            yield _sse("editor", {"agentName": "editor", "status": "done", "message": "Suggestions ready"})
        except Exception as exc:
            print("\n========== PIPELINE ERROR ==========")
            traceback.print_exc()
            print("====================================\n")

            yield _sse("error", {
                "message": f"Pipeline failed: {exc}"
            })
            return

        match_result = state.get("match_result", {})
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
            "questions": state.get("questions", []),
            "suggestions": state.get("suggestions", {}),
            "createdAt": datetime.now(timezone.utc),
        }
        if match_doc["userId"] is not None:
            match_id = await save_match_result(match_doc)
            state["matchResultId"] = match_id

        state.pop("parsed_text", None)
        state.pop("job_text", None)
        state.pop("events", None)
        yield _sse("complete", state)

    return StreamingResponse(stream(), media_type="text/event-stream")


@router.post("/embed-jd")
async def embed_jd(payload: EmbedJobRequest) -> dict[str, Any]:
    embedding = embed_text(payload.jdText)
    pgvector_id = await upsert_job_embedding(payload.jobId, payload.jdText, embedding)
    if pgvector_id is not None:
        await update_job_embedding_id(payload.jobId, pgvector_id)
    return {"ok": True, "jobId": payload.jobId, "pgvectorId": pgvector_id}
