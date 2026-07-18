"""
6.2 에러 응답 포맷 / 6.3 주요 에러 코드
"""
from fastapi import HTTPException


class AppError(HTTPException):
    def __init__(self, error_code: str, message: str, status_code: int):
        super().__init__(
            status_code=status_code,
            detail={"error_code": error_code, "message": message, "status": status_code},
        )


def invalid_image() -> AppError:
    return AppError("INVALID_IMAGE", "이미지 형식/용량 오류입니다.", 400)


def meal_not_found() -> AppError:
    return AppError("MEAL_NOT_FOUND", "해당 식사 기록을 찾을 수 없습니다.", 404)


def health_profile_not_set() -> AppError:
    return AppError("HEALTH_PROFILE_NOT_SET", "건강 프로필이 설정되지 않았습니다.", 422)


def school_meal_not_available() -> AppError:
    return AppError("SCHOOL_MEAL_NOT_AVAILABLE", "해당 날짜의 급식 정보가 없습니다.", 404)


def ai_service_unavailable() -> AppError:
    return AppError("AI_SERVICE_UNAVAILABLE", "이미지 인식 서비스에 연결할 수 없습니다.", 503)


def user_not_found() -> AppError:
    return AppError("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", 404)


def food_not_found() -> AppError:
    return AppError("FOOD_NOT_FOUND", "음식 정보를 찾을 수 없습니다.", 404)


def duplicate_user() -> AppError:
    return AppError("DUPLICATE_USER", "이미 가입된 사용자입니다.", 409)


def invalid_credentials() -> AppError:
    return AppError("INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.", 401)
