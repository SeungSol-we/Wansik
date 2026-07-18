from datetime import datetime

from pydantic import BaseModel, Field

from app.models.meal import (
    Caution,
    MealGuide,
    MealItem,
    MealSource,
    MealType,
    RecognitionStatus,
)


# ---- 5.1.1 급식 자동 기록 ----
class MealFromSchoolMealRequest(BaseModel):
    date: str  # "YYYY-MM-DD"
    meal_type: MealType


class MealSkipRequest(BaseModel):
    reason: str | None = None


# ---- 5.1.2 사진 인식 ----
class PhotoRecognitionCandidate(BaseModel):
    food_name_raw: str
    confidence: float
    matched_food_id: str | None = None
    low_confidence: bool = False


class PhotoRecognitionResponse(BaseModel):
    recognition_status: RecognitionStatus
    candidates: list[PhotoRecognitionCandidate]
    fallback_required: bool


class PhotoRecognitionConfirmItem(BaseModel):
    food_name_raw: str
    matched_food_id: str | None = None
    amount: str | None = None


class PhotoRecognitionConfirmRequest(BaseModel):
    meal_type: MealType
    eaten_at: datetime
    photo_url: str | None = None
    items: list[PhotoRecognitionConfirmItem]


# ---- 5.1.3 수기 입력 ----
class ManualMealItemRequest(BaseModel):
    food_name_raw: str
    food_id: str | None = None
    amount: str | None = None


class ManualMealRequest(BaseModel):
    meal_type: MealType
    eaten_at: datetime
    items: list[ManualMealItemRequest]


# ---- 공통 응답 ----
class MealResponse(BaseModel):
    meal_id: str = Field(alias="_id")
    user_id: str
    meal_type: MealType
    source: MealSource
    eaten_at: datetime
    photo_url: str | None = None
    recognition_status: RecognitionStatus
    items: list[MealItem]
    guide: MealGuide
    skipped: bool = False

    model_config = {"populate_by_name": True}


class MealGuideResponse(BaseModel):
    meal_id: str
    cautions: list[Caution]


class EatingOrderResponse(BaseModel):
    meal_id: str
    eating_order: list[str]
    unclassified: list[str]
