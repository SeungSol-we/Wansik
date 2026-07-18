"""
4.6 school_meal_cache 컬렉션
"""
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class SchoolMealItem(BaseModel):
    food_name_raw: str
    category: str


class SchoolMealCacheDocument(BaseModel):
    id: str = Field(alias="_id")  # "{school_code}_{date}_{meal_type}"
    school_code: str
    date: str  # "YYYY-MM-DD"
    meal_type: str
    items: list[SchoolMealItem] = Field(default_factory=list)
    synced_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}


class NutritionRule(BaseModel):
    """
    5.1.5 태그-증상 매핑 테이블. nutrition_rules 컬렉션 문서.
    영양사/기획자가 코드 배포 없이 값 조정 가능하도록 별도 컬렉션으로 관리.
    """
    tag: str
    predicted_symptom: str
    recommendation: str
    frequency_threshold: int
    severity: str = "MEDIUM"
