from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_user_id
from app.schemas.analysis import AnalysisReportResponse
from app.services import analysis_service

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])


@router.get("/weekly", response_model=AnalysisReportResponse)
async def get_weekly_analysis(
    user_id: str = Query(...),
    period_start: date = Query(...),
    current_user_id: str = Depends(get_current_user_id),
):
    report = await analysis_service.get_weekly_report(user_id, period_start)
    if not report:
        raise HTTPException(
            status_code=404,
            detail={
                "error_code": "REPORT_NOT_FOUND",
                "message": "해당 기간의 분석 리포트가 없습니다.",
                "status": 404,
            },
        )
    return AnalysisReportResponse(
        user_id=report["user_id"],
        period_start=report["period_start"],
        period_end=report["period_end"],
        summary_text=report["summary_text"],
        illustration_key=report["illustration_key"],
        findings=report["findings"],
    )
