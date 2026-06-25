from typing import List

import asyncpg

from config import get_settings

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool | None:
    global _pool
    settings = get_settings()
    if not settings.postgres_dsn:
        return None
    if _pool is None:
        _pool = await asyncpg.create_pool(settings.postgres_dsn)
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def ensure_tables() -> None:
    pool = await get_pool()
    if pool is None:
        return
    async with pool.acquire() as conn:
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS job_embeddings (
                id BIGSERIAL PRIMARY KEY,
                source_id TEXT UNIQUE NOT NULL,
                text TEXT NOT NULL,
                embedding vector(384),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
            """
        )


async def upsert_job_embedding(source_id: str, text: str, embedding: List[float]) -> int | None:
    pool = await get_pool()
    if pool is None:
        return None
    await ensure_tables()
    vector = "[" + ",".join(str(value) for value in embedding) + "]"
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO job_embeddings (source_id, text, embedding)
            VALUES ($1, $2, $3::vector)
            ON CONFLICT (source_id)
            DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding
            RETURNING id
            """,
            source_id,
            text,
            vector,
        )
    return int(row["id"]) if row else None
