# 식습관 케어 앱 — Backend

기획서(v2.0) 3~6장 기준으로 구현된 FastAPI + MongoDB 백엔드입니다.
Phase 1~2 범위(인증, 급식 자동기록, 사진인식 연동, 수기입력, 가이드 규칙엔진, 주간 리포트 규칙엔진)가
실제로 동작하는 코드로 구현되어 있습니다. 프론트엔드도 실제로 이 백엔드에 연결되어 동작합니다 —
자세한 내용은 이 문서 아래 [Frontend](#식습관-케어-앱--frontend) 섹션 참고.

## 폴더 구조
```
diet-care-app/
├── backend/          # FastAPI 도메인 서버 (실제 구현 완료)
├── ai-service/        # 이미지 인식 마이크로서비스 (구조 + 파이프라인 구현, 가중치는 미배치)
├── front/             # React 프론트엔드 (실제 구현 완료 — 아래 Frontend 섹션 참고)
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
- frontend: http://localhost:3000

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

---

# 식습관 케어 앱 — Frontend

React(Create React App) 프론트엔드입니다. 목업이나 더미 데이터가 아니라 위 백엔드에 실제로
연결되어 동작합니다 — 화면 8개 전부 실제 API 응답을 그대로 쓰고, 데이터가 없으면(예: 이번 주
기록이 아직 없음) 빈 상태를 있는 그대로 보여줍니다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | React 19 (Create React App / react-scripts) |
| 라우팅 | react-router-dom |
| 서버 상태 | @tanstack/react-query |
| 클라이언트 상태 | zustand (+ persist — 로그인 세션을 localStorage에 저장) |
| HTTP | axios |

## 폴더 구조

```
front/
├── public/images/            # 마스코트 일러스트 c1~c7.png (사용자가 직접 제공한 에셋)
├── src/
│   ├── api/                   # axios 클라이언트 + 엔드포인트별 함수, authSession.js(로그인 오케스트레이션)
│   ├── components/             # AuthGate, Mascot, SchoolSearchField, FoodRecommendationGrid, layout/(Screen, PageHeader, BottomNav)
│   ├── pages/                   # 8개 화면 (Home, SchoolMeal, PhotoCapture, RecognitionResult, ManualEntry, MealGuide, WeeklyReport, HealthProfile)
│   ├── hooks/                    # react-query 훅 (useSchoolMeal, useMeals, useHealthProfile, useWeeklyReport)
│   ├── store/                     # useUserStore (zustand)
│   ├── data/                       # foodRecommendations.js, fortuneMessages.js — 태그 기반 프론트 전용 카피
│   ├── utils/                       # date.js, symptomMascot.js
│   └── assets/illustrations/         # TarotCard, Decorations, FoodIcon (SVG로 직접 그린 장식 요소)
├── Dockerfile
└── .env.example
```

## 로컬 실행 (Docker 없이)

```bash
cd front
npm install
cp .env.example .env.local   # REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
npm start
```

- http://localhost:3000
- 백엔드가 먼저 떠 있어야 합니다 (이 문서 위쪽 Backend 섹션 참고)

## Docker Compose로 실행

루트의 `docker compose up --build`(또는 `... frontend`)로 함께 뜹니다 —
`docker-compose.yml`의 `frontend` 서비스가 `front/Dockerfile`로 빌드됩니다.

## 인증

더미/게스트 계정이 아니라 백엔드 `/api/v1/auth/*`를 그대로 쓰는 실제 회원가입·로그인입니다.

- 로그인 세션(accessToken)은 zustand persist로 localStorage에 저장되고, 새로고침 시
  `GET /api/v1/auth/me`로 프로필(닉네임/학교/학년/반)을 다시 불러옵니다.
- accessToken은 60분 뒤 만료됩니다(백엔드에 refresh token 없음) — 만료되면 자동 로그아웃되어
  로그인 화면으로 돌아갑니다.
- `GET /api/v1/auth/me`는 프론트 작업 중 필요해서 백엔드에 새로 추가한 엔드포인트입니다. 기존
  `TokenResponse`엔 `user_id`만 있고 프로필 정보가 없어서, 로그인만으로는 닉네임·학교를 알 방법이
  없었습니다 (`backend/app/routers/auth.py`).

## 학교 검색

회원가입 시 학교 코드를 직접 입력하는 대신, 백엔드에 새로 추가한
`GET /api/v1/schools/search?keyword=`(나이스 학교기본정보 API 프록시, `backend/app/routers/schools.py`)로
학교 이름을 검색해 선택합니다. 인증이 필요 없는 공개 엔드포인트입니다(가입 전에도 써야 하므로).

## 화면별 실데이터 연결 메모

- **추천 음식** (홈 "오늘의 추천", 식사 가이드 "추천 음식"): 백엔드엔 태그별 추천 음식 API가 없어서,
  실제 caution/finding의 태그(예: "매운맛", "고당분")를 `src/data/foodRecommendations.js` 매핑
  테이블에 연결해 표시합니다. 태그는 실데이터, 추천 음식·이유 문구는 프론트에서 큐레이션한 카피입니다.
  음식을 누르면 왜 추천하는지 이유가 나옵니다.
- **홈 "오늘의 운세"**: 백엔드에 일일 요약 API가 없어(주간 리포트만 존재), 이번 주 주간 리포트의
  `illustration_key`를 `src/data/fortuneMessages.js`로 매핑해 보여줍니다 — 기록이 없으면 그렇다고
  솔직하게 표시합니다.
- **마스코트 이미지**: `src/components/Mascot.js`가 상황(로딩/성공/경고 등)에 맞는 이미지를 고릅니다.
  식사 가이드·주간 리포트에서는 실제 증상 텍스트를 보고 이미지를 고르도록
  `src/utils/symptomMascot.js`로 매핑되어 있어(인덱스로 그냥 돌려쓰지 않음), 같은 증상엔 항상 같은
  이미지가 뜹니다.
- **알레르기 옵션**: `backend/app/batch/seed_foods.py`에 실제로 쓰인 allergens 문자열과 정확히
  맞춰뒀습니다(예: "계란"이 아니라 "달걀", "새우"가 아니라 "갑각류") — 문자열이 정확히 같아야
  `guide_service.py`의 매칭이 되기 때문입니다.

## 알려진 제약

- 사진 인식은 백엔드 `VISION_API_KEY`가 비어 있으면 항상 빈 결과를 반환합니다(위 Backend 섹션 참고) —
  이 경우 자동으로 수기입력으로 안내됩니다.
- 식사 목록 조회(`GET /meals`) API가 백엔드에 없어서, 특정 식사(`meal_id`)를 알아야만 가이드를 볼 수
  있습니다. "오늘 뭘 먹었는지 전체 목록으로 보기" 같은 화면은 아직 없습니다.
- 계정 정보(닉네임/학교/학년/반) 수정 API가 백엔드에 없어서, 건강 프로필 화면에서 조회만 가능하고
  수정은 회원가입 시에만 할 수 있습니다.
- 알레르기·지병 주의사항은 `foods` 컬렉션의 tags/allergens 태깅 정확도에 의존합니다. 음식 이름에
  드러나지 않는 재료(예: 제육볶음 양념의 대두·밀, 김치의 갑각류 젓갈)도 최대한 반영했지만, 실제
  서비스 전에는 정확한 재료 데이터베이스로 교체가 필요합니다.
- 지병(위염/당뇨/아토피/천식/비염) 기반 주의사항은 `guide_service.py`의 `CONDITION_RISK_TAGS`
  매핑을 따르는 일반적인 생활 습관 조언 수준이며, 의료 자문을 대체하지 않습니다.
