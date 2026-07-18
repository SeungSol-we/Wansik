"""
YOLOv8 wrapper — 트레이 이미지 내 음식 영역(bbox) 탐지.

실제 학습된 가중치(weights/*.pt)는 8장 TBD(한국 급식 이미지 데이터셋 확보) 이후
배치되어야 하므로, 가중치가 없는 개발 환경에서는 지연 로드 후
예외 발생 시 빈 탐지 결과를 반환하도록 방어적으로 구성한다.
"""
from pathlib import Path

WEIGHTS_PATH = Path(__file__).resolve().parent.parent / "weights" / "yolov8n-food.pt"

_model = None


def _load_model():
    global _model
    if _model is not None:
        return _model
    try:
        from ultralytics import YOLO  # 지연 임포트 (무거운 의존성)

        if WEIGHTS_PATH.exists():
            _model = YOLO(str(WEIGHTS_PATH))
        else:
            _model = None
    except ImportError:
        _model = None
    return _model


def detect_food_regions(image_bytes: bytes) -> list[dict]:
    """
    반환: [{"bbox": [x1, y1, x2, y2], "crop_index": int}, ...]
    가중치 미배치 상태에서는 빈 리스트를 반환한다 (fallback_required 유도).
    """
    model = _load_model()
    if model is None:
        return []

    import io

    from PIL import Image

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model.predict(image, verbose=False)

    regions = []
    for i, box in enumerate(results[0].boxes):
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
        regions.append({"bbox": [x1, y1, x2, y2], "crop_index": i})
    return regions
