from fastapi import APIRouter, Depends, Query

from app.core.errors import food_not_found
from app.core.security import get_current_user_id
from app.models.meal import Severity
from app.repositories import food_repo, health_profile_repo, school_meal_repo
from app.schemas.food import FoodCautionResponse

router = APIRouter(prefix="/api/v1/foods", tags=["foods"])


@router.get("/{food_id}/caution", response_model=FoodCautionResponse)
async def get_food_caution(
    food_id: str, user_id: str = Query(...), current_user_id: str = Depends(get_current_user_id)
):
    food = await food_repo.get_by_id(food_id)
    if not food:
        raise food_not_found()

    profile = await health_profile_repo.get_by_user_id(user_id)
    allergies = set(profile["allergies"]) if profile else set()
    is_allergen = bool(set(food.get("allergens", [])) & allergies)

    if is_allergen:
        return FoodCautionResponse(
            food_id=food_id,
            food_name=food["name"],
            is_allergen=True,
            possible_symptom="알레르기 반응 가능",
            recommendation="알레르기 유발 가능 성분이 포함되어 있어요. 섭취에 유의하세요.",
            severity=Severity.HIGH,
        )

    rules = {r.tag: r for r in await school_meal_repo.get_nutrition_rules()}
    for tag in food.get("tags", []):
        rule = rules.get(tag)
        if rule:
            return FoodCautionResponse(
                food_id=food_id,
                food_name=food["name"],
                is_allergen=False,
                possible_symptom=rule.predicted_symptom,
                recommendation=rule.recommendation,
                severity=Severity(rule.severity),
            )

    return FoodCautionResponse(food_id=food_id, food_name=food["name"], is_allergen=False)
