from typing import Any
from urllib.parse import unquote, urlparse

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from config import get_settings


def _database_name() -> str:
    settings = get_settings()
    if settings.mongo_uri:
        path = urlparse(settings.mongo_uri).path.strip("/")
        if path:
            return unquote(path.split("/")[0])
    return settings.mongo_db_name

_client: AsyncIOMotorClient | None = None


def get_mongo_client() -> AsyncIOMotorClient | None:
    global _client
    settings = get_settings()
    if not settings.mongo_uri:
        return None
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_database():
    client = get_mongo_client()
    if client is None:
        return None
    return client[_database_name()]


def to_object_id(value: str) -> ObjectId:
    return ObjectId(value)


async def close_mongo() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


async def find_resume(resume_id: str) -> dict[str, Any] | None:
    db = get_database()
    if db is None:
        return None
    return await db.resumes.find_one({"_id": to_object_id(resume_id)})


async def find_job_text(job_id: str) -> dict[str, Any] | None:
    db = get_database()
    if db is None:
        return None
    object_id = to_object_id(job_id)
    job = await db.jobs.find_one({"_id": object_id})
    if job:
        return job
    return await db.joblistings.find_one({"_id": object_id})


async def save_match_result(result: dict[str, Any]) -> str | None:
    db = get_database()
    if db is None:
        return None
    insert_result = await db.matchresults.insert_one(result)
    return str(insert_result.inserted_id)


async def update_job_embedding_id(job_id: str, pgvector_id: int) -> None:
    db = get_database()
    if db is None:
        return
    await db.jobs.update_one({"_id": to_object_id(job_id)}, {"$set": {"pgvectorId": pgvector_id}})
