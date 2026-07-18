from fastapi import APIRouter, Depends, File, UploadFile

from app.core.errors import invalid_image
from app.core.security import get_current_user_id
from app.repositories import user_repo
from app.schemas.meal import (
    EatingOrderResponse,
    ManualMealRequest,
    MealFromSchoolMealRequest,
    MealGuideResponse,
    MealResponse,
    MealSkipRequest,
    PhotoRecognitionCandidate,
    PhotoRecognitionConfirmRequest,
    PhotoRecognitionResponse,
)
from app.services import meal_service, recognition_service

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10MB


# ---- 5.1.1 급식 자동 기록 확정 ----
@router.post("/from-school-meal", response_model=MealResponse)
async def from_school_meal(
    payload: MealFromSchoolMealRequest, current_user_id: str = Depends(get_current_user_id)
):
    user = await user_repo.get_by_id(current_user_id)
    doc = await meal_service.create_from_school_meal(
        user_id=current_user_id,
        school_code=user["school_code"],
        date_str=payload.date,
        meal_type=payload.meal_type,
    )
    return MealResponse.model_validate(doc.model_dump(by_alias=True))


@router.patch("/{meal_id}/skip", status_code=204)
async def skip_meal(
    meal_id: str, payload: MealSkipRequest, current_user_id: str = Depends(get_current_user_id)
):
    await meal_service.skip_meal(meal_id, payload.reason)


# ---- 5.1.3 수기 입력 ----
@router.post("/manual", response_model=MealResponse)
async def create_manual_meal(
    payload: ManualMealRequest, current_user_id: str = Depends(get_current_user_id)
):
    doc = await meal_service.create_manual_meal(
        user_id=current_user_id,
        meal_type=payload.meal_type,
        eaten_at=payload.eaten_at,
        raw_items=[item.model_dump() for item in payload.items],
    )
    return MealResponse.model_validate(doc.model_dump(by_alias=True))


# ---- 5.1.2 사진 촬영 인식 ----
@router.post("/photo-recognition", response_model=PhotoRecognitionResponse)
async def photo_recognition(
    file: UploadFile = File(...), current_user_id: str = Depends(get_current_user_id)
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise invalid_image()

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise invalid_image()

    raw_result = await recognition_service.detect_and_classify(
        image_bytes, file.filename or "meal.jpg", file.content_type
    )
    detections = raw_result.get("detections", [])
    candidates, fallback_required = await recognition_service.build_candidates(detections)

    recognition_status = "FAILED" if fallback_required else "SUCCESS"
    return PhotoRecognitionResponse(
        recognition_status=recognition_status,
        candidates=[PhotoRecognitionCandidate(**c) for c in candidates],
        fallback_required=fallback_required,
    )


@router.post("/photo-recognition/confirm", response_model=MealResponse)
async def confirm_photo_recognition(
    payload: PhotoRecognitionConfirmRequest, current_user_id: str = Depends(get_current_user_id)
):
    doc = await meal_service.confirm_photo_meal(
        user_id=current_user_id,
        meal_type=payload.meal_type,
        eaten_at=payload.eaten_at,
        photo_url=payload.photo_url,
        raw_items=[item.model_dump() for item in payload.items],
    )
    return MealResponse.model_validate(doc.model_dump(by_alias=True))


# ---- 5.2 / 5.3 가이드 조회 ----
@router.get("/{meal_id}/guide", response_model=MealGuideResponse)
async def get_meal_guide(meal_id: str, current_user_id: str = Depends(get_current_user_id)):
    meal = await meal_service.get_meal_or_404(meal_id)
    return MealGuideResponse(meal_id=meal_id, cautions=meal["guide"]["cautions"])


@router.get("/{meal_id}/eating-order", response_model=EatingOrderResponse)
async def get_eating_order(meal_id: str, current_user_id: str = Depends(get_current_user_id)):
    meal = await meal_service.get_meal_or_404(meal_id)
    guide = meal["guide"]
    return EatingOrderResponse(
        meal_id=meal_id,
        eating_order=guide.get("eating_order", []),
        unclassified=guide.get("unclassified", []),
    )
