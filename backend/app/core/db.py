"""
Motor(비동기 MongoDB) 클라이언트.
4장 데이터 모델의 인덱스 정의를 앱 시작 시점에 보장한다.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

settings = get_settings()

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[settings.mongo_db_name]
    return _db


async def ensure_indexes() -> None:
    db = get_db()

    # 4.2 health_profiles
    await db.health_profiles.create_index("user_id", unique=True)

    # 4.3 foods
    await db.foods.create_index("name", unique=True)
    await db.foods.create_index("tags")

    # 4.4 meals
    await db.meals.create_index([("user_id", 1), ("eaten_at", -1)])

    # 4.5 analysis_reports
    await db.analysis_reports.create_index([("user_id", 1), ("period_start", -1)])

    # 4.6 school_meal_cache
    await db.school_meal_cache.create_index(
        [("school_code", 1), ("date", 1), ("meal_type", 1)], unique=True
    )

    # users
    await db.users.create_index("school_code")

    # nutrition_rules (5.1.5 운영 컬렉션)
    await db.nutrition_rules.create_index("tag", unique=True)


async def close_client() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
