"""
5.2.1 가이드 생성 로직
5.3 메뉴별 식사 순서 가이드
"""
from app.models.meal import Caution, MealGuide, MealItem, Severity
from app.repositories import food_repo, health_profile_repo, school_meal_repo

# 5.3: 채소 -> 단백질 -> 탄수화물 -> 국물/후식
CATEGORY_ORDER = ["채소", "단백질", "탄수화물", "국물", "후식"]

# health_profiles.conditions 에 표시한 지병에 안 좋은 nutrition_rules 태그
# (5.1.5) 매핑. 의료 진단이 아니라 일반적인 생활 습관 조언 수준이며, 프론트
# 문구에도 "의료 자문을 대체하지 않는다"는 안내가 함께 붙는다.
CONDITION_RISK_TAGS: dict[str, list[str]] = {
    "위염": ["매운맛", "튀김", "고지방", "고나트륨"],
    "당뇨": ["고당분"],
    "아토피": ["고당분", "유제품", "고지방"],
    "천식": ["튀김", "고지방"],
    "비염": ["유제품"],
}
CONDITION_SYMPTOM: dict[str, str] = {
    "위염": "위 점막 자극으로 위염 증상 악화 가능",
    "당뇨": "혈당이 급격히 오를 수 있음",
    "아토피": "피부 트러블 악화 가능",
    "천식": "염증 반응 유발 가능",
    "비염": "점액 분비 증가로 코막힘 악화 가능",
}


async def build_meal_guide(user_id: str, items: list[MealItem]) -> MealGuide:
    """
    Meal 확정 이벤트 발생 시 호출.
    ① health_profiles 조회
    ② allergens ∩ allergies 체크 -> HIGH
    ③ 그 외는 nutrition_rules(5.1.5)와 대조 -> MEDIUM/LOW
    ⑤ meals.guide.cautions 로 반환 (④ 푸시 알림은 별도 트리거로 처리)
    """
    profile = await health_profile_repo.get_by_user_id(user_id)
    allergies = set(profile["allergies"]) if profile else set()
    conditions = set(profile["conditions"]) if profile else set()

    food_ids = [item.food_id for item in items if item.food_id]
    foods_by_id = {f["_id"]: f for f in await food_repo.get_many_by_ids(food_ids)}
    rules = {r.tag: r for r in await school_meal_repo.get_nutrition_rules()}

    cautions: list[Caution] = []
    high_severity_triggered = False

    for item in items:
        food = foods_by_id.get(item.food_id) if item.food_id else None
        if not food:
            continue

        food_tags = set(food.get("tags", []))
        food_allergens = set(food.get("allergens", []))
        matched_allergens = food_allergens & allergies

        if matched_allergens:
            cautions.append(
                Caution(
                    food_name=item.food_name_raw,
                    possible_symptom="알레르기 반응 가능",
                    recommendation="알레르기 유발 가능 성분이 포함되어 있어요. 섭취에 유의하세요.",
                    severity=Severity.HIGH,
                )
            )
            high_severity_triggered = True
        else:
            # 이미 알레르기로 HIGH 경고가 뜬 음식엔 같은 음식에 대한 일반
            # 영양 팁까지 겹쳐 보여주지 않는다 (③ "알레르기 아닌 항목은" 조건).
            for tag in food_tags:
                rule = rules.get(tag)
                if rule:
                    cautions.append(
                        Caution(
                            food_name=f"{item.food_name_raw}({tag})",
                            possible_symptom=rule.predicted_symptom,
                            recommendation=rule.recommendation,
                            severity=Severity(rule.severity),
                        )
                    )

        # 지병 주의사항은 알레르기 매칭 여부와 무관하게 항상 따로 확인한다 —
        # 사용자가 명시적으로 등록한 지병이라 일반 영양 팁보다 우선순위가 높다.
        for condition in conditions:
            risky_tags = food_tags & set(CONDITION_RISK_TAGS.get(condition, []))
            if risky_tags:
                cautions.append(
                    Caution(
                        food_name=f"{item.food_name_raw}({condition})",
                        possible_symptom=CONDITION_SYMPTOM.get(condition, f"{condition} 증상 악화 가능"),
                        recommendation=f"{condition}이(가) 있다면 {', '.join(sorted(risky_tags))} 섭취에 주의해주세요.",
                        severity=Severity.MEDIUM,
                    )
                )

    eating_order, unclassified = _build_eating_order(items, foods_by_id)

    guide = MealGuide(cautions=cautions, eating_order=eating_order, unclassified=unclassified)

    if high_severity_triggered:
        await _trigger_high_severity_push(user_id)

    return guide


def _build_eating_order(
    items: list[MealItem], foods_by_id: dict
) -> tuple[list[str], list[str]]:
    """
    5.3: category 기준 정렬. 동일 카테고리는 등록 순서 유지.
    food_id 미매칭 항목은 최하단 + unclassified로 분리.
    """
    ordered: list[str] = []
    unclassified: list[str] = []

    for category in CATEGORY_ORDER:
        for item in items:
            food = foods_by_id.get(item.food_id) if item.food_id else None
            if food and food.get("category") == category:
                ordered.append(item.food_name_raw)

    matched_names = set(ordered)
    for item in items:
        food = foods_by_id.get(item.food_id) if item.food_id else None
        if not food or item.food_name_raw not in matched_names:
            if item.food_name_raw not in unclassified:
                unclassified.append(item.food_name_raw)

    return ordered + unclassified, unclassified


async def _trigger_high_severity_push(user_id: str) -> None:
    """
    ④ HIGH severity 발생 시 푸시 알림 트리거 (알레르기 인지 목적).
    실제 푸시 연동(FCM 등)은 Phase 4 범위. 현재는 훅만 제공.
    """
    # TODO(Phase 4): FCM/APNs 연동
    print(f"[PUSH][HIGH_SEVERITY] user_id={user_id} 알레르기 유발 가능 성분이 포함된 식사가 기록되었습니다.")
