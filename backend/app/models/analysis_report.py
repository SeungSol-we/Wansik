"""
4.5 analysis_reports 컬렉션 (주간 리포트)
"""
from datetime import date, datetime, timezone

from pydantic import BaseModel, Field


class Finding(BaseModel):
    tag: str
    frequency: int
    predicted_symptom: str
    message: str


class AnalysisReportDocument(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    period_start: date
    period_end: date
    summary_text: str
    illustration_key: str
    findings: list[Finding] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
