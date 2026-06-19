from io import BytesIO
from pathlib import Path

import httpx
import pdfplumber

from config import get_settings


async def fetch_pdf_bytes(url: str) -> bytes:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content


def extract_text_from_pdf_bytes(data: bytes) -> str:
    chunks: list[str] = []
    with pdfplumber.open(BytesIO(data)) as pdf:
        for page in pdf.pages:
            chunks.append(page.extract_text() or "")
    return "\n".join(chunk for chunk in chunks if chunk).strip()


def extract_text_from_pdf_path(path: str) -> str:
    data = Path(path).read_bytes()
    return extract_text_from_pdf_bytes(data)


async def extract_text_from_pdf_url(url: str) -> str:
    return extract_text_from_pdf_bytes(await fetch_pdf_bytes(url))
