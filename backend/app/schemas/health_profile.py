from pydantic import BaseModel, Field

from app.models.health_profile import DietType


class HealthProfileUpsertRequest(BaseModel):
    allergies: list[str] = Field(default_factory=list)
    diet_type: DietType = DietType.NONE
    conditions: list[str] = Field(default_factory=list)


class HealthProfileResponse(BaseModel):
    user_id: str
    allergies: list[str]
    diet_type: DietType
    conditions: list[str]
    updated_at: str
