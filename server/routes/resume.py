from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import tempfile
import fitz
from services.resume_parser import parse_resume, extract_entities

router = APIRouter(prefix="/resume", tags=["resume"])


class ParseResponse(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    experience: list[str] = []
    education: list[str] = []
    companies: list[str] = []


class ExtractEntitiesResponse(BaseModel):
    entities: list[dict]


@router.post("/parse", response_model=ParseResponse)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        text = ""
        with fitz.open(tmp_path) as doc:
            for page in doc:
                text += page.get_text()

        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")

        result = parse_resume(text)
        return ParseResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")


@router.post("/extract-entities", response_model=ExtractEntitiesResponse)
async def extract_entities_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        text = ""
        with fitz.open(tmp_path) as doc:
            for page in doc:
                text += page.get_text()

        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")

        entities = extract_entities(text)
        return ExtractEntitiesResponse(entities=entities)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract entities: {str(e)}")
