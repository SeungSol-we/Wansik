"""
foods 컬렉션 초기 데이터 시딩 스크립트 (8장 TBD: "Food 마스터 데이터 초기 구축 방식 — 수작업").

학교 급식에서 자주 나오는 음식 위주로 category/tags/allergens를 채워
가이드 엔진(5.2)과 식사 순서 정렬(5.3), 주간 리포트(5.1.4)가 실제로 동작하도록 한다.

- category: 채소 / 단백질 / 탄수화물 / 국물 / 후식  (5.3 정렬 기준)
- tags: 매운맛 / 고당분 / 고지방 / 튀김 / 고나트륨 / 유제품  (5.1.5 nutrition_rules 매핑과 동일해야 가이드가 생성됨)
- allergens: health_profiles.allergies와 겹치면 HIGH 경고 (5.2.1)

이미 존재하는 음식(name 기준)은 건너뛰고, 없는 음식만 새로 추가한다 (재실행 안전).

실행 방법:
  로컬:        cd backend && python -m app.batch.seed_foods
  docker:      docker compose exec backend python -m app.batch.seed_foods
"""
import asyncio

from app.core.db import get_db
from app.core.ids import new_id

FOODS: list[dict] = [
    # 탄수화물
    {"name": "현미밥", "category": "탄수화물", "tags": [], "allergens": []},
    {"name": "흰쌀밥", "category": "탄수화물", "tags": [], "allergens": []},
    {"name": "잡곡밥", "category": "탄수화물", "tags": [], "allergens": []},
    {"name": "카레라이스", "category": "탄수화물", "tags": ["고나트륨"], "allergens": []},
    {"name": "짜장면", "category": "탄수화물", "tags": ["고나트륨", "고지방"], "allergens": ["밀", "대두"]},

    # 단백질
    {"name": "제육볶음", "category": "단백질", "tags": ["매운맛", "고지방"], "allergens": ["돼지고기"]},
    {"name": "닭갈비", "category": "단백질", "tags": ["매운맛"], "allergens": []},
    {"name": "돈까스", "category": "단백질", "tags": ["튀김", "고지방"], "allergens": ["돼지고기", "밀", "달걀"]},
    {"name": "탕수육", "category": "단백질", "tags": ["튀김", "고당분", "고지방"], "allergens": ["돼지고기", "밀"]},
    {"name": "계란말이", "category": "단백질", "tags": [], "allergens": ["달걀"]},
    {"name": "고등어구이", "category": "단백질", "tags": ["고나트륨"], "allergens": ["고등어"]},
    {"name": "떡갈비", "category": "단백질", "tags": ["고당분"], "allergens": ["소고기", "밀"]},
    {"name": "순살치킨", "category": "단백질", "tags": ["튀김", "고지방"], "allergens": ["닭고기", "밀"]},
    {"name": "새우튀김", "category": "단백질", "tags": ["튀김", "고지방"], "allergens": ["갑각류", "밀"]},

    # 채소
    {"name": "시금치나물", "category": "채소", "tags": [], "allergens": []},
    {"name": "콩나물무침", "category": "채소", "tags": [], "allergens": ["대두"]},
    {"name": "오이무침", "category": "채소", "tags": [], "allergens": []},
    {"name": "김치", "category": "채소", "tags": ["매운맛", "고나트륨"], "allergens": []},
    {"name": "깍두기", "category": "채소", "tags": ["매운맛", "고나트륨"], "allergens": []},
    {"name": "브로콜리무침", "category": "채소", "tags": [], "allergens": []},

    # 국물
    {"name": "미역국", "category": "국물", "tags": [], "allergens": []},
    {"name": "된장찌개", "category": "국물", "tags": ["고나트륨"], "allergens": ["대두"]},
    {"name": "김치찌개", "category": "국물", "tags": ["매운맛", "고나트륨"], "allergens": []},
    {"name": "순두부찌개", "category": "국물", "tags": ["매운맛"], "allergens": ["대두"]},
    {"name": "떡국", "category": "국물", "tags": [], "allergens": ["밀"]},

    # 후식
    {"name": "요구르트", "category": "후식", "tags": ["유제품", "고당분"], "allergens": ["우유"]},
    {"name": "우유", "category": "후식", "tags": ["유제품"], "allergens": ["우유"]},
    {"name": "과일화채", "category": "후식", "tags": ["고당분"], "allergens": []},
    {"name": "초코케이크", "category": "후식", "tags": ["고당분", "고지방", "유제품"], "allergens": ["밀", "우유", "달걀"]},
    {"name": "아이스크림", "category": "후식", "tags": ["고당분", "유제품"], "allergens": ["우유"]},
]


async def run() -> None:
    db = get_db()
    inserted, skipped = 0, 0

    for food in FOODS:
        existing = await db.foods.find_one({"name": food["name"]})
        if existing:
            skipped += 1
            continue

        doc = {
            "_id": new_id("f"),
            "name": food["name"],
            "category": food["category"],
            "tags": food["tags"],
            "allergens": food["allergens"],
        }
        await db.foods.insert_one(doc)
        inserted += 1

    print(f"[seed_foods] 추가 {inserted}건, 이미 존재해서 건너뜀 {skipped}건 (전체 {len(FOODS)}건)")


if __name__ == "__main__":
    asyncio.run(run())
