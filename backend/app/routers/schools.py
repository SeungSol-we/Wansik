"""
학교 이름 검색 (온보딩 화면에서 학교 코드를 몰라도 이름으로 찾아 선택하기 위함).
가입 전에도 써야 하므로 인증이 필요 없는 공개 엔드포인트다.
"""
from fastapi import APIRouter, Query

from app.schemas.school import SchoolSearchResponse, SchoolSearchResult
from app.services import school_search_service

router = APIRouter(prefix="/api/v1/schools", tags=["schools"])


@router.get("/search", response_model=SchoolSearchResponse)
async def search_schools(keyword: str = Query(..., min_length=1)):
    results = await school_search_service.search_schools(keyword)
    return SchoolSearchResponse(results=[SchoolSearchResult(**r) for r in results])