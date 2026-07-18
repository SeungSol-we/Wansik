# 더 이상 사용하지 않음

이 서비스는 로컬 YOLOv8/EfficientNet 모델 대신 외부 Vision API(OpenAI GPT-4o mini 등,
`.env`의 VISION_API_KEY/VISION_API_BASE_URL/VISION_MODEL로 설정)를 호출하는 방식으로 변경되었습니다.
따라서 이 폴더에 가중치 파일을 배치할 필요가 없습니다.

로컬 모델 학습/파인튜닝 방식으로 되돌리고 싶다면 app/inference/pipeline.py를
detect -> crop -> classify 파이프라인으로 다시 구현하면 됩니다.
