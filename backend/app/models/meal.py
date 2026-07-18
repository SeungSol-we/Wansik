"""
4.4 meals 컬렉션 (식사 기록, 아이템/가이드 임베드)
"""
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class MealType(str, Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACK = "SNACK"


class MealSource(str, Enum):
    SCHOOL_AUTO = "SCHOOL_AUTO"
    PHOTO = "PHOTO"
    MANUAL = "MANUAL"


class RecognitionStatus(str, Enum):
    NOT_APPLICABLE = "NOT_APPLICABLE"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class Severity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class MealItem(BaseModel):
    meal_item_id: str
    food_id: str | None = None
    food_name_raw: str
    amount: str | None = None
    confidence: float | None = None
    low_confidence: bool = False


class Caution(BaseModel):
    food_name: str
    possible_symptom: str
    recommendation: str
    severity: Severity


class MealGuide(BaseModel):
    cautions: list[Caution] = Field(default_factory=list)
    eating_order: list[str] = Field(default_factory=list)
    unclassified: list[str] = Field(default_factory=list)


class MealDocument(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    meal_type: MealType
    source: MealSource
    eaten_at: datetime
    photo_url: str | None = None
    recognition_status: RecognitionStatus = RecognitionStatus.NOT_APPLICABLE
    items: list[MealItem] = Field(default_factory=list)
    guide: MealGuide = Field(default_factory=MealGuide)
    skipped: bool = False
    skip_reason: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
