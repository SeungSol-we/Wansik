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

## Vision API 키 발급 (5.1.2 사진 음식 인식)

**OpenAI (기본값, 권장)**
1. https://platform.openai.com 가입 → API keys 메뉴 → "Create new secret key"
2. 결제 수단 등록 필요 (사용량 기반 과금이지만 사진 1장당 비용이 매우 저렴함, 1M 토큰당 입력 $0.15/출력 $0.6 수준)
3. `.env`에 `VISION_API_KEY=sk-...` 입력

**NVIDIA NIM (무료 대안)**
1. https://build.nvidia.com 가입 → API 키 발급(`nvapi-`로 시작)
2. 가입 시 무료 크레딧 제공, 신용카드 불필요 (단 분당 요청 수 제한 있음)
3. `.env`에서 아래 3줄 주석 해제 + `VISION_API_KEY`만 발급받은 값으로 교체
   ```
   VISION_API_BASE_URL=https://integrate.api.nvidia.com/v1
   VISION_MODEL=meta/llama-3.2-90b-vision-instruct
   ```

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
- **ai-service 사진 인식**: 로컬 YOLOv8/EfficientNet 대신 외부 Vision API(OpenAI GPT-4o mini 기본값)를
  호출하는 방식으로 구현되어 있습니다. GPU/모델 학습이 필요 없고, `.env`의 `VISION_API_KEY`만 채우면
  바로 동작합니다. 키가 비어 있으면 빈 탐지 결과를 반환해 자동으로 수기입력 fallback으로 전환됩니다.
  `VISION_API_BASE_URL`/`VISION_MODEL`만 바꾸면 NVIDIA NIM 등 다른 OpenAI 호환 Vision API로도
  교체 가능합니다(자세한 값은 `.env.example` 주석 참고). backend와의 REST 계약은 그대로라 backend
  코드는 수정할 필요가 없습니다.
  참고: 사진이 외부 API로 전송되므로, 미성년자 대상 서비스인 만큼 해당 API 제공사의 데이터
  보존/학습 활용 정책을 운영 전에 확인하는 걸 권장합니다.
- **Food 마스터 데이터**: `foods` 컬렉션 초기 데이터(태그/카테고리/알레르겐)는 별도 시딩 스크립트가
  필요합니다(수작업 vs 외부 영양DB 연동, 8장 TBD).
- **법정대리인 동의**: 회원가입 시 `guardian_consent` 플래그만 최소 반영했습니다. 실제 동의 절차(문자 인증 등)는
  개인정보보호법 검토 후 별도 구현이 필요합니다.
- **알레르기 푸시 알림**: `guide_service._trigger_high_severity_push`에 훅만 존재하며, FCM/APNs 연동은
  Phase 4 범위입니다.
