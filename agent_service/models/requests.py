from typing import Literal, Optional

from pydantic import BaseModel
from pydantic import Field

class ParseRequest(BaseModel):
    cloudinaryUrl: str | None = None
    pdfUrl: str | None = None
    filePath: str | None = None


class AnalyzeRequest(BaseModel):
    resumeId: str
    jobId: str
    parsedText: str | None = None
    jdText: str | None = None
    difficulty: Optional[Literal["easy", "medium", "hard"]] = None


class DiscoverRequest(BaseModel):
    resumeId: str
    parsedText: str = Field(default="")
    query: str | None = None
    location: str | None = None
    limit: int = Field(default=20, ge=1, le=50)


class EmbedJobRequest(BaseModel):
    jobId: str
    jdText: str
