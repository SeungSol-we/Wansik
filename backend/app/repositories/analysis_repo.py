from datetime import date

from app.core.db import get_db
from app.core.ids import new_id
from app.models.analysis_report import AnalysisReportDocument, Finding


async def get_latest_by_user(user_id: str, period_start: date) -> dict | None:
    return await get_db().analysis_reports.find_one(
        {"user_id": user_id, "period_start": period_start.isoformat()},
        sort=[("period_start", -1)],
    )


async def insert(
    user_id: str,
    period_start: date,
    period_end: date,
    summary_text: str,
    illustration_key: str,
    findings: list[Finding],
) -> AnalysisReportDocument:
    doc = AnalysisReportDocument(
        _id=new_id("r"),
        user_id=user_id,
        period_start=period_start,
        period_end=period_end,
        summary_text=summary_text,
        illustration_key=illustration_key,
        findings=findings,
    )
    payload = doc.model_dump(by_alias=True)
    payload["period_start"] = period_start.isoformat()
    payload["period_end"] = period_end.isoformat()
    await get_db().analysis_reports.insert_one(payload)
    return doc


async def list_active_user_ids() -> list[str]:
    """
    최근 7일 내 식사 기록이 있는 사용자만 '활성 사용자'로 간주 (5.1.4 배치 대상).
    """
    return await get_db().meals.distinct("user_id")
