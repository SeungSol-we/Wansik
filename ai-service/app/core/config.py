"""
사진 음식 인식용 Vision API 설정.
OpenAI(gpt-4o-mini)를 기본값으로 하되, base_url/model만 바꾸면
NVIDIA NIM 등 OpenAI 호환 엔드포인트로 그대로 교체 가능하도록 구성.

교체 예시 (NVIDIA NIM):
  VISION_API_BASE_URL=https://integrate.api.nvidia.com/v1
  VISION_API_KEY=nvapi-...
  VISION_MODEL=meta/llama-3.2-90b-vision-instruct
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    vision_api_key: str = ""
    vision_api_base_url: str = "https://api.openai.com/v1"
    vision_model: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
