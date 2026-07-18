"""
foods 컬렉션 초기 데이터 시딩 스크립트 (8장 TBD: "Food 마스터 데이터 초기 구축 방식 — 수작업").

학교 급식에서 자주 나오는 음식 위주로 category/tags/allergens를 채워
가이드 엔진(5.2)과 식사 순서 정렬(5.3), 주간 리포트(5.1.4)가 실제로 동작하도록 한다.

- category: 채소 / 단백질 / 탄수화물 / 국물 / 후식  (5.3 정렬 기준)
- tags: 매운맛 / 고당분 / 고지방 / 튀김 / 고나트륨 / 유제품  (5.1.5 nutrition_rules 매핑과 동일해야 가이드가 생성됨)
- allergens: health_profiles.allergies와 겹치면 HIGH 경고 (5.2.1)
  음식 "이름"에 드러나지 않는 재료도 포함한다 — 예: 제육볶음의 고추장 양념엔
  대두·밀이 들어가고, 김치엔 젓갈(갑각류)이 들어가는 식. 사용자는 "제육볶음"이라는
  이름만 보고는 대두 알레르기 위험을 알 수 없으므로, 실제 조리에 쓰이는 재료
  기준으로 태깅해야 알레르기 경고가 의미가 있다.

이름 기준으로 upsert 한다 (있으면 category/tags/allergens 갱신, 없으면 추가) —
재료 태깅을 보강할 때마다 재실행해서 반영할 수 있어야 하기 때문에 "이미 있으면
건너뛰기"가 아니라 항상 최신 값으로 덮어쓴다.

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
    # 카레 루(roux)는 밀가루로 걸쭉하게 만들고 유제품이 들어가는 제품이 많다.
    {"name": "카레라이스", "category": "탄수화물", "tags": ["고나트륨"], "allergens": ["밀", "우유"]},
    {"name": "짜장면", "category": "탄수화물", "tags": ["고나트륨", "고지방"], "allergens": ["밀", "대두", "돼지고기"]},

    # 단백질
    # 고추장/간장 양념엔 대두·밀이 기본으로 들어간다.
    {"name": "제육볶음", "category": "단백질", "tags": ["매운맛", "고지방"], "allergens": ["돼지고기", "대두", "밀"]},
    {"name": "닭갈비", "category": "단백질", "tags": ["매운맛"], "allergens": ["닭고기", "대두", "밀"]},
    {"name": "돈까스", "category": "단백질", "tags": ["튀김", "고지방"], "allergens": ["돼지고기", "밀", "달걀"]},
    {"name": "탕수육", "category": "단백질", "tags": ["튀김", "고당분", "고지방"], "allergens": ["돼지고기", "밀", "달걀"]},
    {"name": "계란말이", "category": "단백질", "tags": [], "allergens": ["달걀"]},
    {"name": "고등어구이", "category": "단백질", "tags": ["고나트륨"], "allergens": ["고등어"]},
    {"name": "떡갈비", "category": "단백질", "tags": ["고당분"], "allergens": ["소고기", "밀", "대두"]},
    {"name": "순살치킨", "category": "단백질", "tags": ["튀김", "고지방"], "allergens": ["닭고기", "밀", "달걀"]},
    {"name": "새우튀김", "category": "단백질", "tags": ["튀김", "고지방"], "allergens": ["갑각류", "밀", "달걀"]},

    # 채소
    {"name": "시금치나물", "category": "채소", "tags": [], "allergens": []},
    {"name": "콩나물무침", "category": "채소", "tags": [], "allergens": ["대두"]},
    {"name": "오이무침", "category": "채소", "tags": [], "allergens": []},
    # 한국식 김치는 대부분 새우젓/멸치액젓으로 간을 한다 — 갑각류 알레르기가
    # 있으면 "김치"라는 이름만으로는 알 수 없는 위험 재료.
    {"name": "김치", "category": "채소", "tags": ["매운맛", "고나트륨"], "allergens": ["갑각류"]},
    {"name": "깍두기", "category": "채소", "tags": ["매운맛", "고나트륨"], "allergens": ["갑각류"]},
    {"name": "브로콜리무침", "category": "채소", "tags": [], "allergens": []},

    # 국물
    {"name": "미역국", "category": "국물", "tags": [], "allergens": ["소고기"]},
    {"name": "된장찌개", "category": "국물", "tags": ["고나트륨"], "allergens": ["대두"]},
    # 김치찌개엔 보통 돼지고기와 김치(갑각류 젓갈)가 함께 들어간다.
    {"name": "김치찌개", "category": "국물", "tags": ["매운맛", "고나트륨"], "allergens": ["돼지고기", "갑각류"]},
    {"name": "순두부찌개", "category": "국물", "tags": ["매운맛"], "allergens": ["대두", "달걀"]},
    {"name": "떡국", "category": "국물", "tags": [], "allergens": ["밀", "소고기"]},

    # 후식
    {"name": "요구르트", "category": "후식", "tags": ["유제품", "고당분"], "allergens": ["우유"]},
    {"name": "우유", "category": "후식", "tags": ["유제품"], "allergens": ["우유"]},
    {"name": "과일화채", "category": "후식", "tags": ["고당분"], "allergens": []},
    {"name": "초코케이크", "category": "후식", "tags": ["고당분", "고지방", "유제품"], "allergens": ["밀", "우유", "달걀"]},
    {"name": "아이스크림", "category": "후식", "tags": ["고당분", "유제품"], "allergens": ["우유"]},
    {"name": "땅콩조림", "category": "후식", "tags": [], "allergens": ["땅콩"]},
    {"name": "복숭아화채", "category": "후식", "tags": ["고당분"], "allergens": ["복숭아"]},
]


async def run() -> None:
    db = get_db()
    inserted, updated = 0, 0

    for food in FOODS:
        existing = await db.foods.find_one({"name": food["name"]})
        payload = {
            "category": food["category"],
            "tags": food["tags"],
            "allergens": food["allergens"],
        }
        if existing:
            await db.foods.update_one({"_id": existing["_id"]}, {"$set": payload})
            updated += 1
            continue

        await db.foods.insert_one({"_id": new_id("f"), "name": food["name"], **payload})
        inserted += 1

    print(f"[seed_foods] 추가 {inserted}건, 갱신 {updated}건 (전체 {len(FOODS)}건)")


if __name__ == "__main__":
    asyncio.run(run())