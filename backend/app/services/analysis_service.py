"""
5.1.4 주간 식습관 분석 리포트 규칙 엔진.

1) 기간 내 meals.items -> food_id로 foods.tags 조회
2) 태그별 등장 빈도 집계
3) frequency >= threshold 인 태그만 findings로 채택
4) 최고 빈도 태그를 기준으로 illustration_key, summary_text 결정
5) (Phase 3, 선택) LLM 후처리 — 이번 구현에서는 규칙 기반 문장을 그대로 사용
"""
from collections import Counter
from datetime import date, datetime, timedelta

from app.models.analysis_report import AnalysisReportDocument, Finding
from app.repositories import analysis_repo, food_repo, meal_repo, school_meal_repo


async def generate_weekly_report_for_user(
    user_id: str, period_start: date, period_end: date
) -> AnalysisReportDocument | None:
    start_dt = datetime.combine(period_start, datetime.min.time())
    end_dt = datetime.combine(period_end, datetime.max.time())

    meals = await meal_repo.find_by_user_and_period(user_id, start_dt, end_dt)
    if not meals:
        return None

    food_ids = {
        item["food_id"]
        for meal in meals
        for item in meal.get("items", [])
        if item.get("food_id")
    }
    foods_by_id = {f["_id"]: f for f in await food_repo.get_many_by_ids(list(food_ids))}

    tag_counter: Counter[str] = Counter()
    for meal in meals:
        for item in meal.get("items", []):
            food = foods_by_id.get(item.get("food_id"))
            if food:
                tag_counter.update(food.get("tags", []))

    rules = {r.tag: r for r in await school_meal_repo.get_nutrition_rules()}

    findings: list[Finding] = []
    for tag, frequency in tag_counter.items():
        rule = rules.get(tag)
        threshold = rule.frequency_threshold if rule else 3
        if frequency < threshold:
            continue
        predicted_symptom = rule.predicted_symptom if rule else "식습관 불균형"
        message = f"이번 주에는 '{tag}' 관련 음식 섭취가 많아 {predicted_symptom}이(가) 발생할 가능성이 있습니다."
        findings.append(
            Finding(
                tag=tag,
                frequency=frequency,
                predicted_symptom=predicted_symptom,
                message=message,
            )
        )

    findings.sort(key=lambda f: f.frequency, reverse=True)

    if findings:
        top = findings[0]
        illustration_key = _illustration_key_for_tag(top.tag)
        summary_text = top.message
    else:
        illustration_key = "balanced"
        summary_text = "이번 주는 특별히 치우친 식습관 패턴이 발견되지 않았어요. 지금처럼 균형 잡힌 식사를 유지해보세요."

    return await analysis_repo.insert(
        user_id=user_id,
        period_start=period_start,
        period_end=period_end,
        summary_text=summary_text,
        illustration_key=illustration_key,
        findings=findings,
    )


def _illustration_key_for_tag(tag: str) -> str:
    mapping = {
        "매운맛": "stomach_ache",
        "고당분": "skin_trouble",
        "고지방": "bloating",
        "튀김": "bloating",
        "고나트륨": "puffy_face",
        "유제품": "bloating",
    }
    return mapping.get(tag, "general_caution")


async def get_weekly_report(user_id: str, period_start: date) -> dict | None:
    """
    항상 최신 meals 기준으로 다시 계산한다. 예전엔 그 주에 한 번 생성된 리포트를
    영구 캐시로 반환했는데, 그러면 주 초반에 매운 음식을 먹어 리포트가 한 번
    생성된 뒤로는 이후 무엇을 먹든 화면이 그 스냅샷에 멈춰 있는 문제가 있었다
    (예: 나중에 튀김/고당분 위주로 먹어도 계속 "매운맛" 결과만 보임).
    일요일 00:10 배치(app/batch/generate_weekly_report.py)가 만드는 스냅샷은
    그대로 두되, 사용자가 직접 조회할 때는 그 주가 끝나기 전까지 항상 실시간
    집계를 보여준다.
    """
    period_end = period_start + timedelta(days=6)
    doc = await generate_weekly_report_for_user(user_id, period_start, period_end)
    if doc:
        return doc.model_dump(by_alias=True)
    return await analysis_repo.get_latest_by_user(user_id, period_start)
