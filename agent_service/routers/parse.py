from fastapi import APIRouter, HTTPException

from agents.extractor import extract_resume_data
from models.requests import ParseRequest
from models.responses import ParseResponse
from tools.pdf_tools import extract_text_from_pdf_path, extract_text_from_pdf_url

router = APIRouter()


@router.post("/parse-pdf", response_model=ParseResponse)
async def parse_pdf(payload: ParseRequest) -> ParseResponse:
    try:
        if payload.filePath:
            parsed_text = extract_text_from_pdf_path(payload.filePath)
        else:
            url = payload.cloudinaryUrl or payload.pdfUrl
            if not url:
                raise HTTPException(status_code=400, detail="cloudinaryUrl, pdfUrl, or filePath is required")
            parsed_text = await extract_text_from_pdf_url(url)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Unable to parse PDF: {exc}") from exc

    return ParseResponse(parsedText=parsed_text, extractedData=extract_resume_data(parsed_text))
