"""
매주 일요일 00:10 실행 배치. 활성 사용자 전원에 대해 최근 7일 meals 집계
-> analysis_reports insert.
"""
import asyncio
from datetime import date, timedelta

from app.repositories.analysis_repo import list_active_user_ids
from app.services.analysis_service import generate_weekly_report_for_user


async def run() -> None:
    today = date.today()
    period_end = today
    period_start = today - timedelta(days=6)

    user_ids = await list_active_user_ids()
    generated = 0
    for user_id in user_ids:
        report = await generate_weekly_report_for_user(user_id, period_start, period_end)
        if report:
            generated += 1

    print(
        f"[generate_weekly_report] {period_start}~{period_end} "
        f"대상 {len(user_ids)}명 중 {generated}건 생성"
    )


if __name__ == "__main__":
    asyncio.run(run())
