from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db.mongo import close_mongo
from db.postgres import close_pool, ensure_tables
from routers import analyze, discover, parse


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_tables()
    yield
    await close_pool()
    await close_mongo()


settings = get_settings()

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse.router)
app.include_router(analyze.router)
app.include_router(discover.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
