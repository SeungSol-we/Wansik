"""
5.1.2 흐름: ④ YOLOv8로 트레이 내 음식 영역 N개 탐지 -> ⑤ crop -> EfficientNet-B0 분류
"""
import io

from PIL import Image

from app.inference.classifier import classify_crop
from app.inference.detector import detect_food_regions

MODEL_VERSION = "yolov8n-food-v1 + efficientnet-b0-food101-v1"


def run_pipeline(image_bytes: bytes) -> dict:
    regions = detect_food_regions(image_bytes)

    if not regions:
        return {"detections": [], "model_version": MODEL_VERSION}

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    detections = []
    for region in regions:
        x1, y1, x2, y2 = region["bbox"]
        crop = image.crop((x1, y1, x2, y2))
        result = classify_crop(crop)
        detections.append(
            {
                "bbox": region["bbox"],
                "food_name_raw": result["food_name_raw"],
                "confidence": result["confidence"],
            }
        )

    return {"detections": detections, "model_version": MODEL_VERSION}
