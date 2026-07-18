"""
5.1.2 사진 촬영 인식 - ai-service 호출 + 신뢰도 임계값 판단.
ai-service는 순수 추론만 담당하고, matched_food_id 매칭/임계값 판단은 backend가 수행.
"""
import httpx

from app.core.config import get_settings
from app.core.errors import ai_service_unavailable
from app.repositories import food_repo

settings = get_settings()


async def detect_and_classify(image_bytes: bytes, filename: str, content_type: str) -> dict:
    """
    ai-service의 POST /internal/vision/detect-and-classify 호출.
    """
    url = f"{settings.ai_service_url}/internal/vision/detect-and-classify"
    files = {"file": (filename, image_bytes, content_type)}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, files=files)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPError:
        raise ai_service_unavailable()


async def build_candidates(raw_detections: list[dict]) -> tuple[list[dict], bool]:
    """
    ⑥ BE: 분류 결과를 foods 컬렉션과 매칭
      - confidence >= threshold  -> matched_food_id 확정
      - confidence < threshold   -> matched_food_id=null, low_confidence=True
      - 탐지 0건                 -> fallback_required=True
    """
    threshold = settings.recognition_confidence_threshold
    candidates = []
    any_high_confidence = False

    for det in raw_detections:
        name = det["food_name_raw"]
        confidence = det["confidence"]
        matched_food_id = None
        low_confidence = confidence < threshold

        if not low_confidence:
            food = await food_repo.find_best_match_by_name(name)
            if food:
                matched_food_id = food["_id"]
            any_high_confidence = True

        candidates.append(
            {
                "food_name_raw": name,
                "confidence": confidence,
                "matched_food_id": matched_food_id,
                "low_confidence": low_confidence,
            }
        )

    fallback_required = len(raw_detections) == 0 or not any_high_confidence
    return candidates, fallback_required
