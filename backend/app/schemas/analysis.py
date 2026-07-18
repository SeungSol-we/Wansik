from datetime import date

from pydantic import BaseModel

from app.models.analysis_report import Finding


class AnalysisReportResponse(BaseModel):
    user_id: str
    period_start: date
    period_end: date
    summary_text: str
    illustration_key: str
    findings: list[Finding]
