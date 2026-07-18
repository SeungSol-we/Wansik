from app.core.db import get_db


async def get_by_id(food_id: str) -> dict | None:
    return await get_db().foods.find_one({"_id": food_id})


async def get_by_name(name: str) -> dict | None:
    return await get_db().foods.find_one({"name": name})


async def get_many_by_ids(food_ids: list[str]) -> list[dict]:
    if not food_ids:
        return []
    cursor = get_db().foods.find({"_id": {"$in": food_ids}})
    return [doc async for doc in cursor]


async def find_best_match_by_name(name_raw: str) -> dict | None:
    """
    간단한 이름 매칭. 운영 단계에서는 동의어 테이블/자모 유사도 등으로 고도화 가능.
    """
    return await get_by_name(name_raw)
