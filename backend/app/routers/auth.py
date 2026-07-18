"""
6.1 인증
POST /api/v1/auth/signup, POST /api/v1/auth/login -> JWT(access) 발급
"""
from fastapi import APIRouter, Depends

from app.core.errors import duplicate_user, invalid_credentials, user_not_found
from app.core.security import create_access_token, get_current_user_id, hash_password, verify_password
from app.repositories import user_repo
from app.schemas.auth import LoginRequest, MeResponse, SignupRequest, TokenResponse

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
        school_name=payload.school_name,
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


# 로그인만으로는 닉네임/학교 같은 프로필 정보를 알 수 없어(TokenResponse는
# user_id만 반환) 프론트가 로그인 직후 자기 계정 정보를 조회할 수 있어야 한다.
@router.get("/me", response_model=MeResponse)
async def get_me(current_user_id: str = Depends(get_current_user_id)):
    user = await user_repo.get_by_id(current_user_id)
    if not user:
        raise user_not_found()
    return MeResponse(
        user_id=user["_id"],
        login_id=user["login_id"],
        nickname=user["nickname"],
        school_code=user["school_code"],
        school_name=user.get("school_name", ""),
        grade=user["grade"],
        class_no=user["class_no"],
    )
