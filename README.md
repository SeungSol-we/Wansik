# 식습관 케어 앱 — Backend

기획서(v2.0) 3~6장 기준으로 구현된 FastAPI + MongoDB 백엔드입니다.
Phase 1~2 범위(인증, 급식 자동기록, 사진인식 연동, 수기입력, 가이드 규칙엔진, 주간 리포트 규칙엔진)가
실제로 동작하는 코드로 구현되어 있습니다. `frontend/`는 3장 구조도만 반영된 빈 스캐폴드입니다.

## 폴더 구조
```
diet-care-app/
├── backend/          # FastAPI 도메인 서버 (실제 구현 완료)
├── ai-service/        # 이미지 인식 마이크로서비스 (구조 + 파이프라인 구현, 가중치는 미배치)
├── frontend/          # React 스캐폴드 (미구현, 3장 구조도 참고용 폴더만 존재)
├── docker-compose.yml
└── .env.example
```

## 로컬 실행 (Docker 없이, backend만)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 로컬 MongoDB가 필요합니다 (docker run -p 27017:27017 mongo:7 등)
cp ../.env.example .env
uvicorn app.main:app --reload
```

- Swagger 문서: http://localhost:8000/docs
- 헬스체크: http://localhost:8000/health

## Docker Compose로 전체 스택 실행

```bash
cp .env.example .env   # JWT_SECRET 등 값 채우기
docker compose up --build
```

- backend: http://localhost:8000
- ai-service: http://localhost:8100
- frontend: http://localhost:3000 (스캐폴드만 존재, 실행 실패할 수 있음)

## 배치 잡 수동 실행

```bash
cd backend
python -m app.batch.sync_school_meals        # 5.1.1 급식 동기화
python -m app.batch.generate_weekly_report   # 5.1.4 주간 리포트 생성
```

운영 환경에서는 `app/main.py`의 `lifespan`에 등록된 APScheduler가 각각
매일 05:00 / 매주 일요일 00:10 에 자동 실행합니다.

## 테스트

```bash
cd backend
pytest
```

## 구현 범위 / 제약사항 (8장 TBD 연동)

- **급식 Open API**: 실제 제공 기관·인증키가 미확정이라 `SCHOOL_MEAL_API_BASE_URL`/`SCHOOL_MEAL_API_KEY`가
  비어 있으면 빈 결과(방학 처리)를 반환하는 어댑터로 구성했습니다. 실제 스펙 확정 시
  `app/services/school_meal_sync.py`의 `_parse_provider_response`만 교체하면 됩니다.
- **ai-service 모델 가중치**: YOLOv8 / EfficientNet-B0(Food-101 파인튜닝) 가중치 파일이 없는 상태이므로,
  파이프라인 코드(`ai-service/app/inference/*`)는 구현되어 있으나 가중치 미배치 시 빈 탐지 결과를 반환해
  자동으로 수기입력 fallback으로 전환됩니다. `torch`/`ultralytics`는 `requirements.txt`에 주석 처리되어 있으며,
  실제 GPU 인프라 확정 후 주석 해제하고 `weights/`에 가중치를 배치하세요.
- **Food 마스터 데이터**: `foods` 컬렉션 초기 데이터(태그/카테고리/알레르겐)는 별도 시딩 스크립트가
  필요합니다(수작업 vs 외부 영양DB 연동, 8장 TBD).
- **법정대리인 동의**: 회원가입 시 `guardian_consent` 플래그만 최소 반영했습니다. 실제 동의 절차(문자 인증 등)는
  개인정보보호법 검토 후 별도 구현이 필요합니다.
- **알레르기 푸시 알림**: `guide_service._trigger_high_severity_push`에 훅만 존재하며, FCM/APNs 연동은
  Phase 4 범위입니다.
