# NGC PyTorch 베이스 이미지 사용 (GPU 필요 시)
# FROM nvcr.io/nvidia/pytorch:24.05-py3
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8100
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]
