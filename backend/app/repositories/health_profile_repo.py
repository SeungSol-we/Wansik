from datetime import datetime, timezone

from app.core.db import get_db
from app.core.ids import new_id
from app.models.health_profile import DietType, HealthProfileDocument


async def get_by_user_id(user_id: str) -> dict | None:
    return await get_db().health_profiles.find_one({"user_id": user_id})


async def upsert(
    user_id: str, allergies: list[str], diet_type: DietType, conditions: list[str]
) -> HealthProfileDocument:
    db = get_db()
    existing = await get_by_user_id(user_id)
    now = datetime.now(timezone.utc)
    if existing:
        await db.health_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "allergies": allergies,
                    "diet_type": diet_type.value,
                    "conditions": conditions,
                    "updated_at": now,
                }
            },
        )
        existing.update(
            allergies=allergies, diet_type=diet_type.value, conditions=conditions, updated_at=now
        )
        return HealthProfileDocument.model_validate(existing)

    doc = HealthProfileDocument(
        _id=new_id("hp"),
        user_id=user_id,
        allergies=allergies,
        diet_type=diet_type,
        conditions=conditions,
        updated_at=now,
    )
    await db.health_profiles.insert_one(doc.model_dump(by_alias=True))
    return doc
