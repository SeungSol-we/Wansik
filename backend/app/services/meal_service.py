"""
식사 기록 생성 오케스트레이션. 확정 즉시 guide_service의 규칙 엔진을 실행해
meals.guide 까지 채운 뒤 반환한다 (문서 4.4 주석: "읽기 성능 우선").
"""
from datetime import datetime

from app.core.errors import meal_not_found, school_meal_not_available
from app.models.meal import MealDocument, MealItem, MealSource, MealType, RecognitionStatus
from app.repositories import food_repo, meal_repo, school_meal_repo
from app.services import guide_service


async def create_from_school_meal(user_id: str, school_code: str, date_str: str, meal_type: MealType) -> MealDocument:
    cache = await school_meal_repo.get_cached(school_code, date_str, meal_type.value)
    if not cache or not cache.get("items"):
        raise school_meal_not_available()

    existing = await meal_repo.find_existing_school_meal(user_id, date_str, meal_type)
    if existing:
        # 이미 확정된 기록이 있으면 그대로 반환 (중복 생성 방지)
        return MealDocument.model_validate(existing)

    items: list[MealItem] = []
    for i, raw in enumerate(cache["items"]):
        food = await food_repo.find_best_match_by_name(raw["food_name_raw"])
        items.append(
            MealItem(
                meal_item_id=f"mi_{i:02d}",
                food_id=food["_id"] if food else None,
                food_name_raw=raw["food_name_raw"],
                amount=None,
            )
        )

    eaten_at = datetime.fromisoformat(f"{date_str}T12:00:00")
    doc = await meal_repo.insert(
        user_id=user_id,
        meal_type=meal_type,
        source=MealSource.SCHOOL_AUTO,
        eaten_at=eaten_at,
        items=items,
        recognition_status=RecognitionStatus.NOT_APPLICABLE,
    )

    guide = await guide_service.build_meal_guide(user_id, items)
    await meal_repo.update_guide(doc.id, guide)
    doc.guide = guide
    return doc


async def skip_meal(meal_id: str, reason: str | None) -> None:
    meal = await meal_repo.get_by_id(meal_id)
    if not meal:
        raise meal_not_found()
    await meal_repo.mark_skipped(meal_id, reason)


async def create_manual_meal(
    user_id: str, meal_type: MealType, eaten_at: datetime, raw_items: list[dict]
) -> MealDocument:
    items: list[MealItem] = []
    for i, raw in enumerate(raw_items):
        food_id = raw.get("food_id")
        if not food_id:
            food = await food_repo.find_best_match_by_name(raw["food_name_raw"])
            food_id = food["_id"] if food else None
        items.append(
            MealItem(
                meal_item_id=f"mi_{i:02d}",
                food_id=food_id,
                food_name_raw=raw["food_name_raw"],
                amount=raw.get("amount"),
            )
        )

    doc = await meal_repo.insert(
        user_id=user_id,
        meal_type=meal_type,
        source=MealSource.MANUAL,
        eaten_at=eaten_at,
        items=items,
        recognition_status=RecognitionStatus.NOT_APPLICABLE,
    )
    guide = await guide_service.build_meal_guide(user_id, items)
    await meal_repo.update_guide(doc.id, guide)
    doc.guide = guide
    return doc


async def confirm_photo_meal(
    user_id: str,
    meal_type: MealType,
    eaten_at: datetime,
    photo_url: str | None,
    raw_items: list[dict],
) -> MealDocument:
    items: list[MealItem] = []
    for i, raw in enumerate(raw_items):
        # AI 인식이 매칭하지 못했거나(신뢰도 낮음) 사용자가 이름을 직접 고친
        # 경우 matched_food_id 가 비어있을 수 있다 — 이때도 수기입력과 동일하게
        # 이름 기반 fallback 매칭을 해줘야 알레르기/가이드 규칙엔진이 정상 동작한다.
        food_id = raw.get("matched_food_id")
        if not food_id:
            food = await food_repo.find_best_match_by_name(raw["food_name_raw"])
            food_id = food["_id"] if food else None
        items.append(
            MealItem(
                meal_item_id=f"mi_{i:02d}",
                food_id=food_id,
                food_name_raw=raw["food_name_raw"],
                amount=raw.get("amount"),
            )
        )

    doc = await meal_repo.insert(
        user_id=user_id,
        meal_type=meal_type,
        source=MealSource.PHOTO,
        eaten_at=eaten_at,
        items=items,
        photo_url=photo_url,
        recognition_status=RecognitionStatus.SUCCESS,
    )
    guide = await guide_service.build_meal_guide(user_id, items)
    await meal_repo.update_guide(doc.id, guide)
    doc.guide = guide
    return doc


async def get_meal_or_404(meal_id: str) -> dict:
    meal = await meal_repo.get_by_id(meal_id)
    if not meal:
        raise meal_not_found()
    return meal
