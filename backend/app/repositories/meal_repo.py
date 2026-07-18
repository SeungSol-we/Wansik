from datetime import datetime

from app.core.db import get_db
from app.core.ids import new_id
from app.models.meal import MealDocument, MealGuide, MealItem, MealSource, MealType


async def get_by_id(meal_id: str) -> dict | None:
    return await get_db().meals.find_one({"_id": meal_id})


async def insert(
    user_id: str,
    meal_type: MealType,
    source: MealSource,
    eaten_at: datetime,
    items: list[MealItem],
    photo_url: str | None = None,
    recognition_status=None,
) -> MealDocument:
    doc = MealDocument(
        _id=new_id("m"),
        user_id=user_id,
        meal_type=meal_type,
        source=source,
        eaten_at=eaten_at,
        photo_url=photo_url,
        recognition_status=recognition_status or "NOT_APPLICABLE",
        items=items,
        guide=MealGuide(),
    )
    await get_db().meals.insert_one(doc.model_dump(by_alias=True))
    return doc


async def update_guide(meal_id: str, guide: MealGuide) -> None:
    await get_db().meals.update_one(
        {"_id": meal_id}, {"$set": {"guide": guide.model_dump()}}
    )


async def mark_skipped(meal_id: str, reason: str | None) -> None:
    await get_db().meals.update_one(
        {"_id": meal_id}, {"$set": {"skipped": True, "skip_reason": reason}}
    )


async def find_by_user_and_period(user_id: str, start: datetime, end: datetime) -> list[dict]:
    cursor = get_db().meals.find(
        {"user_id": user_id, "eaten_at": {"$gte": start, "$lte": end}, "skipped": {"$ne": True}}
    )
    return [doc async for doc in cursor]


async def find_existing_school_meal(user_id: str, date_str: str, meal_type: MealType) -> dict | None:
    """
    같은 날 같은 끼니의 급식 자동기록 중복 방지.
    """
    start = datetime.fromisoformat(f"{date_str}T00:00:00")
    end = datetime.fromisoformat(f"{date_str}T23:59:59")
    return await get_db().meals.find_one(
        {
            "user_id": user_id,
            "meal_type": meal_type.value,
            "source": MealSource.SCHOOL_AUTO.value,
            "eaten_at": {"$gte": start, "$lte": end},
        }
    )
