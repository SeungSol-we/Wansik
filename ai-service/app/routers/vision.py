"""
내부 API — backend의 recognition_service가 호출한다.
POST /internal/vision/detect-and-classify
"""
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.inference.pipeline import run_pipeline

router = APIRouter(prefix="/internal/vision", tags=["vision"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/detect-and-classify")
async def detect_and_classify(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다.")

    image_bytes = await file.read()
    result = run_pipeline(image_bytes)
    return result
