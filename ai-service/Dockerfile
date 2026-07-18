# 로컬 GPU 추론(YOLOv8/EfficientNet) 대신 외부 Vision API(OpenAI 등)를 호출하는 구조로
# 변경되어 GPU/무거운 ML 의존성이 필요 없다. 일반 python 이미지로 충분.
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8100
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]
