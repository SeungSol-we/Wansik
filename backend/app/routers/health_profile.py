"""
5.2 기능 2 — 개인 건강 상태 기반 맞춤 가이드
POST/GET /api/v1/users/{user_id}/health-profile
"""
from fastapi import APIRouter, Depends

from app.core.errors import health_profile_not_set
from app.core.security import get_current_user_id
from app.repositories import health_profile_repo
from app.schemas.health_profile import HealthProfileResponse, HealthProfileUpsertRequest

router = APIRouter(prefix="/api/v1/users", tags=["health-profile"])


@router.post("/{user_id}/health-profile", response_model=HealthProfileResponse)
async def upsert_health_profile(
    user_id: str,
    payload: HealthProfileUpsertRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    doc = await health_profile_repo.upsert(
        user_id=user_id,
        allergies=payload.allergies,
        diet_type=payload.diet_type,
        conditions=payload.conditions,
    )
    return HealthProfileResponse(
        user_id=doc.user_id,
        allergies=doc.allergies,
        diet_type=doc.diet_type,
        conditions=doc.conditions,
        updated_at=doc.updated_at.isoformat(),
    )


@router.get("/{user_id}/health-profile", response_model=HealthProfileResponse)
async def get_health_profile(
    user_id: str, current_user_id: str = Depends(get_current_user_id)
):
    doc = await health_profile_repo.get_by_user_id(user_id)
    if not doc:
        raise health_profile_not_set()
    return HealthProfileResponse(
        user_id=doc["user_id"],
        allergies=doc["allergies"],
        diet_type=doc["diet_type"],
        conditions=doc["conditions"],
        updated_at=doc["updated_at"].isoformat()
        if hasattr(doc["updated_at"], "isoformat")
        else str(doc["updated_at"]),
    )
