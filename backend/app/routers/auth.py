"""
6.1 인증
POST /api/v1/auth/signup, POST /api/v1/auth/login -> JWT(access) 발급
"""
from fastapi import APIRouter

from app.core.errors import duplicate_user, invalid_credentials
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import user_repo
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(payload: SignupRequest):
    existing = await user_repo.get_by_login_id(payload.login_id)
    if existing:
        raise duplicate_user()

    # 미성년자 대상 서비스 - 법정대리인 동의 절차는 7장 TBD.
    # 현재는 guardian_consent 플래그만 기록/검증하는 최소 구현.
    if not payload.guardian_consent:
        from app.core.errors import AppError

        raise AppError(
            "GUARDIAN_CONSENT_REQUIRED",
            "법정대리인 동의가 필요합니다.",
            422,
        )

    user = await user_repo.create_user(
        login_id=payload.login_id,
        hashed_password=hash_password(payload.password),
        school_code=payload.school_code,
        grade=payload.grade,
        class_no=payload.class_no,
        nickname=payload.nickname,
    )
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await user_repo.get_by_login_id(payload.login_id)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise invalid_credentials()

    token = create_access_token(user["_id"])
    return TokenResponse(access_token=token, user_id=user["_id"])
