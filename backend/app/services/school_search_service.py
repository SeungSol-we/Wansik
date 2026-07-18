"""
나이스 교육정보 개방 포털 학교기본정보(schoolInfo) 검색.
school_meal_sync.py 의 급식 조회와 같은 host/KEY 를 쓰는 별도 엔드포인트라
서비스도 분리해 둔다. 온보딩 화면에서 "학교 코드"를 직접 입력하는 대신
학교 이름으로 검색해 선택할 수 있도록 지원한다.
"""
import httpx

from app.core.config import get_settings

settings = get_settings()


async def search_schools(keyword: str) -> list[dict]:
    if not settings.school_meal_api_key or not keyword.strip():
        return []

    params = {
        "KEY": settings.school_meal_api_key,
        "Type": "json",
        "SCHUL_NM": keyword.strip(),
        "pIndex": 1,
        "pSize": 20,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(settings.school_info_api_base_url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return []

    return _parse_school_search_response(data)


def _parse_school_search_response(data: dict) -> list[dict]:
    try:
        rows = data["schoolInfo"][1]["row"]
    except (KeyError, IndexError, TypeError):
        # 검색 결과 0건이면 나이스가 schoolInfo[1]("row") 대신
        # head 안에 INFO-200 등의 결과 코드만 내려준다.
        return []

    results = []
    for row in rows:
        results.append(
            {
                "school_code": row.get("SD_SCHUL_CODE", ""),
                "school_name": row.get("SCHUL_NM", ""),
                "school_level": row.get("SCHUL_KND_SC_NM", ""),
                "region": row.get("LCTN_SC_NM", ""),
                "address": row.get("ORG_RDNMA"),
            }
        )
    return results