"""
4.2 health_profiles 컬렉션 (user_id 기준 1:1)
"""
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class DietType(str, Enum):
    NONE = "NONE"
    VEGETARIAN = "VEGETARIAN"
    HALAL = "HALAL"


class HealthProfileDocument(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    allergies: list[str] = Field(default_factory=list)
    diet_type: DietType = DietType.NONE
    conditions: list[str] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
