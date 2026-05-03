# SolarWise 프론트엔드

React + TypeScript + Vite 기반의 SolarWise 프론트엔드입니다. 메인 랜딩, 서비스/팀 소개, 인증, 실시간 발전소 대시보드, 발전량 예측, 이상 감지 목록/상세 화면을 포함한 단일 페이지 앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173`으로 접속합니다.

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 실행 |
| `npm run build` | TypeScript 빌드 검사 후 프로덕션 번들 생성 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |

## 백엔드 연결 방법

백엔드 서버를 먼저 `http://localhost:8080`에서 실행한 뒤 프론트엔드 개발 서버를 실행합니다. 프론트엔드는 `/api`로 시작하는 요청을 Vite 프록시를 통해 백엔드로 전달합니다.

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
API:      /api/** -> http://localhost:8080/api/**
```

백엔드 주소가 다르면 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 변경합니다.

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

Vite 설정의 `base`는 `/SolarWise/`로 지정되어 있습니다. GitHub Pages 같은 하위 경로 배포를 기준으로 한 설정이므로, 다른 배포 경로를 사용할 경우 `vite.config.ts`를 확인하세요.

## 기술 스택

- React 18
- TypeScript
- Vite 6
- React Router DOM 6
- ECharts
- CSS Modules
- ESLint

## 프로젝트 구조

이 프로젝트는 `app / api / features / shared` 레이어를 기준으로 구성되어 있습니다.

```text
src/
├── app/                         # React 앱 진입점과 라우팅
│   ├── App.tsx
│   └── main.tsx
├── api/                         # fetch 기반 API 클라이언트와 도메인 API
│   ├── auth.ts
│   ├── client.ts
│   ├── dashboard.ts
│   └── index.ts
├── features/                    # 화면 단위 기능 모듈
│   ├── about/
│   ├── dashboard/
│   ├── dashboard-detection/
│   ├── home/
│   ├── login/
│   ├── power-forecast/
│   ├── service-introduction/
│   ├── settings/
│   └── signup/
├── shared/                      # 공통 레이아웃, 훅, 스타일, UI
│   ├── hooks/
│   ├── layout/
│   ├── styles/
│   └── ui/
├── index.css                    # 전역 스타일
└── vite-env.d.ts
```

## 라우팅 구조

`src/app/main.tsx`에서 `BrowserRouter`를 연결하고, `src/app/App.tsx`에서 전체 라우트를 정의합니다.

```text
/                         -> HomePage
/about                    -> AboutPage
/services                 -> ServiceIntroductionPage
/login                    -> LoginPage
/signup                   -> SignupPage
/dashboard                -> DashboardPage
/power-forecast           -> PowerForecastPage
/anomaly-detection        -> AnomalyDetectionMainPage
/anomaly-detection/detail -> AnomalyDetailPage
/settings                 -> AppLayout + SettingsPage
*                         -> / 로 리다이렉트
```

대시보드 계열 화면은 자체 `DashboardSidebar`를 포함합니다. `/settings`는 `AppLayout` 내부에서 렌더링되는 설정 플레이스홀더 화면입니다.

## 주요 기능

### 마케팅 페이지

- `/`: SolarWise 랜딩 페이지입니다.
- `/services`: 실시간 발전량 트래킹, AI 발전량 예측, AI 패널 이상 감지, XAI 설명 리포트, 예지 정비 알림을 소개합니다.
- `/about`: 팀 소개, 프로젝트 배경, 기술 스택, 협력기업 정보, CTA를 제공합니다.

### 인증

- `/login`: `/api/v1/auth/login`을 호출하고, 성공 시 `accessToken`과 사용자 정보를 `localStorage`에 저장한 뒤 `/dashboard`로 이동합니다.
- `/signup`: `/api/v1/auth/signup`을 호출합니다. 현재 가입 요청 role은 `OWNER`로 고정되어 있고, 성공 시 `/login`으로 이동합니다.
- `apiClient`는 `localStorage.accessToken`이 있으면 `Authorization: Bearer ...` 헤더를 자동으로 추가합니다.
- `SiteHeader`, `DashboardSidebar`, `DashboardSettingsMenu`는 저장된 사용자 정보와 `solarwise-auth-change` 이벤트를 기준으로 로그인 상태를 반영합니다.

### 대시보드

- `/dashboard`는 첫 번째 발전소를 선택해 요약, 실시간 발전량, 예측 그래프, SHAP 기여도, 이상 감지 알림을 표시합니다.
- 사용 API는 발전소 목록, 계측 시계열, 대시보드 요약, 발전량 예측, 이상 이벤트 목록입니다.
- 계측/요약/이상 이벤트는 5초 주기로 갱신하고, 예측 데이터는 30초 주기로 갱신합니다.
- 계측 또는 예측 API 데이터가 없거나 실패하면 차트 확인을 위해 프론트 더미 데이터를 표시합니다.
- 차트는 `shared/ui/EChart.tsx`의 ECharts 래퍼를 사용합니다.

### 이상 감지

- `/anomaly-detection`은 이상 이벤트 목록, 유형/심각도/상태 필터, 정렬, 페이지네이션, 선택 이벤트 요약 패널을 제공합니다.
- 이상 이벤트 목록은 5초 주기로 갱신합니다.
- 선택한 이벤트는 확인 완료(`ACKNOWLEDGED`) 처리할 수 있습니다.
- `/anomaly-detection/detail?eventId=...`은 이벤트 상세, 원인 분석, XAI 판단 근거, 권장 조치, 처리 이력, AI 원인 설명 챗 UI를 표시합니다.
- 상세 화면에서는 확인 완료(`ACKNOWLEDGED`)와 해결 완료(`RESOLVED`) 상태 변경을 지원합니다.

### 발전량 예측

- `/power-forecast`는 XGBoost 기반 예측 화면 시안입니다.
- 예측 요약, 2~3일 예측 차트, SHAP 피처 기여도, 예측 근거 및 기상 정보 UI를 포함합니다.
- 현재 이 화면의 수치는 정적 화면 데이터이며, 실제 API 차트 연동은 `/dashboard`의 예측 카드와 차트 쪽에 구현되어 있습니다.

### 설정

- `/settings`는 설정 UI 확장을 위한 기본 화면입니다.
- 실제 폼, 토글, API 연결은 추후 설정 명세 확정 후 연결하는 상태입니다.

## API 모듈

`src/api/client.ts`는 `fetch` 기반 공통 클라이언트입니다. JSON 요청 헤더와 인증 헤더를 공통 처리하고, 실패 응답의 `message` 또는 `error.message`를 에러 메시지로 사용합니다.

현재 도메인 API는 다음 파일에 분리되어 있습니다.

- `src/api/auth.ts`: 로그인, 회원가입, 인증 세션 저장
- `src/api/dashboard.ts`: 발전소, 계측, 요약, 예측, 이상 이벤트 목록/상세, 이상 이벤트 상태 변경
- `src/api/index.ts`: API 함수와 타입 재수출

주요 백엔드 엔드포인트:

```text
POST  /api/v1/auth/signup
POST  /api/v1/auth/login
GET   /api/v1/plants
GET   /api/v1/plants/{plantId}/measurements
GET   /api/v1/plants/{plantId}/dashboard/summary
GET   /api/v1/plants/{plantId}/forecasts
GET   /api/v1/plants/{plantId}/anomalies
GET   /api/v1/plants/{plantId}/anomalies/{eventId}
PATCH /api/v1/plants/{plantId}/anomalies/{eventId}/status
```

## 상태 관리

- 전역 상태 관리 라이브러리는 사용하지 않습니다.
- 페이지 단위 `useState`, `useMemo`, `useEffect`로 상태를 관리합니다.
- 인증 세션은 `localStorage`의 `accessToken`, `user`에 저장합니다.
- 여러 컴포넌트 간 인증 상태 동기화는 브라우저 `storage` 이벤트와 커스텀 `solarwise-auth-change` 이벤트를 사용합니다.

## 스타일링

- 전역 스타일은 `src/index.css`에 있습니다.
- 페이지와 컴포넌트 스타일은 CSS Modules(`*.module.css`)로 관리합니다.
- 경로 별칭 `@/`를 사용해 `src` 하위 모듈을 참조합니다.
- 마케팅 페이지와 대시보드 페이지는 각 화면의 CSS Module에서 독립적으로 레이아웃과 반응형 스타일을 관리합니다.

## 현재 구현 상태

- 랜딩, 서비스 소개, 팀 소개 페이지가 구현되어 있습니다.
- 로그인/회원가입은 백엔드 인증 API와 연결되어 있습니다.
- 대시보드는 발전소/계측/요약/예측/이상 이벤트 API와 연결되어 있으며, 일부 데이터 부재 시 더미 차트 데이터를 표시합니다.
- 이상 감지 목록과 상세 화면은 이벤트 조회, 폴링, 상태 변경 API와 연결되어 있습니다.
- 발전량 예측 전용 화면은 정적 UI 시안 중심입니다.
- 설정 화면은 아직 플레이스홀더입니다.
