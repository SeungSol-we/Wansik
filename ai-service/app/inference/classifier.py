"""
EfficientNet-B0 (Food-101 파인튜닝) wrapper — crop된 음식 영역을 분류.

Food-101은 서구 음식 위주라 한국 급식 이미지로 별도 파인튜닝이 필수 (8장 TBD).
파인튜닝된 가중치가 없는 환경에서는 더미 저신뢰 결과를 반환해
recognition_service의 fallback 로직이 정상 동작하도록 한다.
"""
from pathlib import Path

WEIGHTS_PATH = Path(__file__).resolve().parent.parent / "weights" / "efficientnet-b0-food101.pt"

_model = None
_class_names: list[str] = []


def _load_model():
    global _model
    if _model is not None:
        return _model
    try:
        import torch

        if WEIGHTS_PATH.exists():
            _model = torch.load(str(WEIGHTS_PATH), map_location="cpu")
            _model.eval()
        else:
            _model = None
    except ImportError:
        _model = None
    return _model


def classify_crop(image_crop) -> dict:
    """
    반환: {"food_name_raw": str, "confidence": float}
    가중치 미배치 상태에서는 저신뢰 더미 결과를 반환한다.
    """
    model = _load_model()
    if model is None:
        return {"food_name_raw": "미분류", "confidence": 0.0}

    import torch
    from torchvision import transforms

    preprocess = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )
    tensor = preprocess(image_crop).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)
        confidence, idx = torch.max(probs, dim=1)

    food_name = _class_names[idx.item()] if idx.item() < len(_class_names) else "미분류"
    return {"food_name_raw": food_name, "confidence": float(confidence.item())}
