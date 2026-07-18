from contextlib import asynccontextmanager
from datetime import date

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.db import close_client, ensure_indexes
from app.repositories.analysis_repo import list_active_user_ids
from app.repositories.school_meal_repo import seed_default_rules
from app.routers import analysis, auth, foods, health_profile, meals, school_meals, schools
from app.services.school_meal_sync import sync_all_schools_for_date

scheduler = AsyncIOScheduler()


async def _job_sync_school_meals() -> None:
    today = date.today().isoformat()
    await sync_all_schools_for_date(today, meal_types=["BREAKFAST", "LUNCH", "DINNER"])


async def _job_generate_weekly_reports() -> None:
    from datetime import timedelta

    from app.services.analysis_service import generate_weekly_report_for_user

    today = date.today()
    period_start = today - timedelta(days=6)
    for user_id in await list_active_user_ids():
        await generate_weekly_report_for_user(user_id, period_start, today)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    await seed_default_rules()

    # 5.1.1 배치: 매일 05:00
    scheduler.add_job(_job_sync_school_meals, CronTrigger(hour=5, minute=0), id="sync_school_meals")
    # 5.1.4 배치: 매주 일요일 00:10
    scheduler.add_job(
        _job_generate_weekly_reports,
        CronTrigger(day_of_week="sun", hour=0, minute=10),
        id="generate_weekly_report",
    )
    scheduler.start()

    yield

    scheduler.shutdown()
    await close_client()


app = FastAPI(title="식습관 케어 앱 API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 운영 환경에서는 프론트엔드 도메인으로 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(health_profile.router)
app.include_router(school_meals.router)
app.include_router(meals.router)
app.include_router(analysis.router)
app.include_router(foods.router)
app.include_router(schools.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}