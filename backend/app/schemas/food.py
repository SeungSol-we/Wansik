from pydantic import BaseModel

from app.models.meal import Severity


class FoodCautionResponse(BaseModel):
    food_id: str
    food_name: str
    is_allergen: bool
    possible_symptom: str | None = None
    recommendation: str | None = None
    severity: Severity | None = None
