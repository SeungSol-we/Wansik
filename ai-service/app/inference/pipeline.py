"""
5.1.2 흐름 대체 구현: 로컬 YOLOv8/EfficientNet 대신
OpenAI 호환 Vision API(GPT-4o mini 기본값)를 호출해 사진 속 음식을 인식한다.

- backend의 recognition_service가 기대하는 응답 스키마
  {"detections": [{"food_name_raw": str, "confidence": float}, ...], "model_version": str}
  는 그대로 유지하므로 backend 쪽 코드는 수정할 필요가 없다.
- confidence는 모델의 softmax 확률이 아니라 "자기 스스로 판단한 확신도"이므로
  로컬 분류 모델보다 덜 엄밀하다. 신뢰도 임계값(RECOGNITION_CONFIDENCE_THRESHOLD)은
  backend 쪽에서 그대로 적용되지만, 참고용 휴리스틱으로 취급하는 게 안전하다.
"""
import base64
import json

import httpx

from app.core.config import get_settings

settings = get_settings()

PROMPT = (
    "이 이미지는 학교 급식 트레이 사진입니다. 사진에 보이는 음식을 각각 한국어 음식 이름으로 "
    "구분해서 나열하세요. 반찬처럼 여러 개가 섞여 있으면 모두 각각 나열하세요. "
    "각 음식에 대해 스스로 얼마나 확신하는지 0.0~1.0 사이 숫자로 판단해 함께 답하세요. "
    "다른 설명 없이 반드시 아래 JSON 형식으로만 답하세요:\n"
    '{"detections": [{"food_name_raw": "제육볶음", "confidence": 0.9}]}\n'
    "음식이 하나도 보이지 않거나 사진을 알아볼 수 없으면 detections를 빈 배열로 답하세요."
)


async def run_pipeline(image_bytes: bytes, content_type: str) -> dict:
    model_version = f"vision-llm:{settings.vision_model}"

    if not settings.vision_api_key:
        # 키 미설정 시 빈 탐지 결과 반환 -> backend가 자동으로 수기입력 fallback 처리
        return {"detections": [], "model_version": model_version}

    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64_image}"

    payload = {
        "model": settings.vision_model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        "temperature": 0,
        "max_tokens": 500,
    }
    headers = {"Authorization": f"Bearer {settings.vision_api_key}"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.vision_api_base_url}/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return {"detections": [], "model_version": model_version}

    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return {"detections": [], "model_version": model_version}

    return {"detections": _parse_detections(content), "model_version": model_version}


def _parse_detections(content: str) -> list[dict]:
    text = content.strip()

    # 일부 모델이 ```json ... ``` 코드블록으로 감싸서 답하는 경우 방어
    if text.startswith("```"):
        text = text.strip("`")
        if "\n" in text:
            first_line, rest = text.split("\n", 1)
            text = rest if first_line.lower().startswith("json") else text

    try:
        parsed = json.loads(text)
        raw_detections = parsed.get("detections", [])
    except (json.JSONDecodeError, AttributeError):
        return []

    detections = []
    for item in raw_detections:
        name = str(item.get("food_name_raw", "")).strip()
        if not name:
            continue
        try:
            confidence = float(item.get("confidence", 0.0))
        except (TypeError, ValueError):
            confidence = 0.0
        detections.append({"food_name_raw": name, "confidence": confidence})

    return detections
