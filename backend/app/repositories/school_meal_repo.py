from datetime import datetime, timezone

from app.core.db import get_db
from app.models.school_meal_cache import NutritionRule, SchoolMealCacheDocument


def _cache_id(school_code: str, date: str, meal_type: str) -> str:
    return f"{school_code}_{date}_{meal_type}"


async def get_cached(school_code: str, date: str, meal_type: str) -> dict | None:
    return await get_db().school_meal_cache.find_one(
        {"_id": _cache_id(school_code, date, meal_type)}
    )


async def upsert_cache(
    school_code: str, date: str, meal_type: str, items: list[dict]
) -> SchoolMealCacheDocument:
    doc = SchoolMealCacheDocument(
        _id=_cache_id(school_code, date, meal_type),
        school_code=school_code,
        date=date,
        meal_type=meal_type,
        items=items,
        synced_at=datetime.now(timezone.utc),
    )
    await get_db().school_meal_cache.update_one(
        {"_id": doc.id}, {"$set": doc.model_dump(by_alias=True)}, upsert=True
    )
    return doc


async def list_all_school_codes() -> list[str]:
    return await get_db().users.distinct("school_code")


async def get_nutrition_rules() -> list[NutritionRule]:
    """
    5.1.5 태그-증상 매핑. nutrition_rules 컬렉션이 비어 있으면
    기획서 표에 정의된 기본값으로 시딩한다.
    """
    db = get_db()
    cursor = db.nutrition_rules.find({})
    rules = [NutritionRule.model_validate(doc) async for doc in cursor]
    if rules:
        return rules
    return await seed_default_rules()


async def seed_default_rules() -> list[NutritionRule]:
    defaults = [
        NutritionRule(tag="매운맛", predicted_symptom="소화불량, 속쓰림",
                      recommendation="수분 섭취, 위 부담 적은 음식 병행", frequency_threshold=3, severity="MEDIUM"),
        NutritionRule(tag="고당분", predicted_symptom="피부 트러블, 혈당 스파이크",
                      recommendation="당분 섭취 후 물 섭취, 다음 끼니 당분 조절", frequency_threshold=3, severity="MEDIUM"),
        NutritionRule(tag="고지방", predicted_symptom="속더부룩함, 여드름",
                      recommendation="채소류 병행 섭취", frequency_threshold=3, severity="LOW"),
        NutritionRule(tag="튀김", predicted_symptom="속더부룩함, 여드름",
                      recommendation="채소류 병행 섭취", frequency_threshold=3, severity="LOW"),
        NutritionRule(tag="고나트륨", predicted_symptom="붓기, 갈증",
                      recommendation="수분 섭취량 증가", frequency_threshold=3, severity="LOW"),
        NutritionRule(tag="유제품", predicted_symptom="(유당불내증 사용자) 복부팽만",
                      recommendation="소량 섭취 권장", frequency_threshold=2, severity="LOW"),
    ]
    db = get_db()
    for rule in defaults:
        await db.nutrition_rules.update_one(
            {"tag": rule.tag}, {"$set": rule.model_dump()}, upsert=True
        )
    return defaults
