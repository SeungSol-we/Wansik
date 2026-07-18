from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    login_id: str = Field(min_length=4, max_length=50)
    password: str = Field(min_length=8, max_length=100)
    school_code: str
    school_name: str = ""
    grade: int
    class_no: int
    nickname: str
    # 미성년자 대상 서비스 - 법정대리인 동의 (7장 TBD, 최소 플래그만 우선 반영)
    guardian_consent: bool = False


class LoginRequest(BaseModel):
    login_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


class MeResponse(BaseModel):
    user_id: str
    login_id: str
    nickname: str
    school_code: str
    school_name: str = ""
    grade: int
    class_no: int
