"""
학교 급식 Open API 연동. 실제 제공 기관/인증키는 8장 TBD 항목이므로
호출부는 SCHOOL_MEAL_API_BASE_URL / SCHOOL_MEAL_API_KEY 환경변수로 주입받는
어댑터 형태로 분리해 둔다. 값이 비어 있으면 방학/휴무로 간주해 빈 배열을 캐싱한다
(문서 5.1.1: "방학·급식 없는 날은 캐시에 items: []로 저장").
"""
import httpx

from app.core.config import get_settings
from app.repositories import school_meal_repo

settings = get_settings()


async def fetch_school_meal_from_provider(school_code: str, date_str: str, meal_type: str) -> list[dict]:
    if not settings.school_meal_api_base_url or not settings.school_meal_api_key:
        # TBD: 실제 급식 Open API(나이스 등) 연동 전이므로 빈 결과 반환
        return []

    params = {
        "KEY": settings.school_meal_api_key,
        "Type": "json",
        "SD_SCHUL_CODE": school_code,
        "MLSV_YMD": date_str.replace("-", ""),
        "MMEAL_SC_CODE": _meal_type_to_provider_code(meal_type),
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(settings.school_meal_api_base_url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return []

    return _parse_provider_response(data)


def _meal_type_to_provider_code(meal_type: str) -> str:
    return {"BREAKFAST": "1", "LUNCH": "2", "DINNER": "3"}.get(meal_type, "2")


def _parse_provider_response(data: dict) -> list[dict]:
    """
    나이스 교육정보 개방 포털 등 급식 API 표준 응답 형태를 가정한 파서.
    실제 응답 스펙 확정 전까지는 방어적으로 빈 배열 반환.
    """
    try:
        rows = data["mealServiceDietInfo"][1]["row"]
    except (KeyError, IndexError, TypeError):
        return []

    items = []
    for row in rows:
        dish_str = row.get("DDISH_NM", "")
        for line in dish_str.split("<br/>"):
            name = line.split("(")[0].strip()
            if name:
                items.append({"food_name_raw": name, "category": "미분류"})
    return items


async def sync_all_schools_for_date(date_str: str, meal_types: list[str]) -> int:
    """
    매일 새벽 배치. 서비스 가입 학교 전체에 대해 당일 급식을 동기화한다.
    """
    school_codes = await school_meal_repo.list_all_school_codes()
    synced = 0
    for school_code in school_codes:
        for meal_type in meal_types:
            items = await fetch_school_meal_from_provider(school_code, date_str, meal_type)
            await school_meal_repo.upsert_cache(school_code, date_str, meal_type, items)
            synced += 1
    return synced
