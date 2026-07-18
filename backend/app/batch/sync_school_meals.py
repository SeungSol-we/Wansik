"""
매일 새벽 05:00 실행 배치 (APScheduler 등록은 app/main.py 참고).
1) 서비스 가입 학교의 school_code 목록 조회
2) 학교별 당일 급식 API 호출 -> school_meal_cache upsert
3) 방학/급식 없는 날은 items: [] 로 저장 (재조회 방지)
"""
import asyncio
from datetime import date

from app.services.school_meal_sync import sync_all_schools_for_date


async def run() -> None:
    today = date.today().isoformat()
    synced = await sync_all_schools_for_date(today, meal_types=["BREAKFAST", "LUNCH", "DINNER"])
    print(f"[sync_school_meals] {today} 기준 {synced}건 동기화 완료")


if __name__ == "__main__":
    asyncio.run(run())
