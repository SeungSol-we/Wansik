"""
5.1.1 급식 자동 기록
GET /api/v1/school-meals?school_code=&date=
"""
from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user_id
from app.repositories import school_meal_repo
from app.schemas.school_meal import SchoolMealItemResponse, SchoolMealResponse

router = APIRouter(prefix="/api/v1/school-meals", tags=["school-meals"])


@router.get("", response_model=SchoolMealResponse)
async def get_school_meal(
    school_code: str = Query(...),
    date: str = Query(...),
    meal_type: str = Query("LUNCH"),
    current_user_id: str = Depends(get_current_user_id),
):
    cache = await school_meal_repo.get_cached(school_code, date, meal_type)
    if not cache or not cache.get("items"):
        return SchoolMealResponse(
            school_code=school_code, date=date, meal_type=meal_type, available=False, items=[]
        )

    return SchoolMealResponse(
        school_code=school_code,
        date=date,
        meal_type=meal_type,
        available=True,
        items=[SchoolMealItemResponse(**item) for item in cache["items"]],
    )
