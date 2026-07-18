"""
환경변수 로드 및 전역 설정.
기획서 3장 프로젝트 구조도 기준: backend/app/core/config.py
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Mongo
    mongo_uri: str = "mongodb://localhost:27017/diet_care"
    mongo_db_name: str = "diet_care"

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # 내부 서비스
    ai_service_url: str = "http://localhost:8100"
    redis_url: str = "redis://localhost:6379/0"

    # 인식 신뢰도 임계값 (5.1.2)
    recognition_confidence_threshold: float = 0.6

    # 급식 Open API (TBD, 8장 참고)
    school_meal_api_key: str = ""
    school_meal_api_base_url: str = ""
    # 나이스 학교 검색(학교명 -> SD_SCHUL_CODE). school_meal_api_key 를 그대로 재사용한다.
    school_info_api_base_url: str = "https://open.neis.go.kr/hub/schoolInfo"

    # 주간 리포트 태그 최소 등장 임계값 (5.1.5)
    default_tag_frequency_threshold: int = 3

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
