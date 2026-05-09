# SolarWise 프론트엔드

React 18 · TypeScript · Vite 6 기반의 SolarWise 단일 페이지 앱입니다. 랜딩과 서비스 소개는 공통 헤더/푸터를 두고, 대시보드·예측·이상 감지·설정 화면은 각각 독립 레이아웃을 사용합니다.

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/SolarWise/` 로 접속합니다. (`vite.config.ts`의 `base: '/SolarWise/'` 때문에 개발 서버 경로도 하위 경로를 사용합니다.)

| 명령 | 설명 |
|------|------|
| `npm run dev` | Vite 개발 서버 |
| `npm run build` | TypeScript 검사 후 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run preview` | 빌드 결과 미리보기 |

## 백엔드 연결

1. 백엔드를 `http://localhost:8080`에서 실행합니다.  
2. 프론트의 `/api/**` 요청은 Vite 프록시가 백엔드로 전달합니다.

```text
예: GET /api/v1/plants → http://localhost:8080/api/v1/plants
```

프로젝트 루트에 `.env`를 두면 프록시 대상을 바꿀 수 있습니다.

```env
VITE_API_PROXY_TARGET=http://localhost:8080
```

## 기술 스택

- React 18 · React Router 6  
- TypeScript · Vite 6  
- ECharts (`src/shared/ui/EChart.tsx`)  
- CSS Modules  
- ESLint  

## 디렉터리 구조

```text
src/
├── app/                 # 진입점, 라우팅 (App.tsx, main.tsx)
├── api/                 # fetch 클라이언트, 인증·대시보드 API
│   ├── auth.ts
│   ├── client.ts
│   ├── dashboard.ts
│   └── index.ts
├── features/            # 화면 단위 모듈
│   ├── about/
│   ├── dashboard/
│   ├── dashboard-detection/
│   ├── home/
│   ├── login/
│   ├── power-forecast/
│   ├── service-introduction/
│   ├── settings/        # 플레이스홀더 /settings + 프로필·알림 설정 페이지
│   └── signup/
├── shared/
│   ├── hooks/           # useHideOnScroll, useDefaultPlant 등
│   ├── layout/          # SiteHeader, AppLayout, DashboardSidebar, DashboardSettingsMenu …
│   ├── styles/
│   ├── ui/              # Button, Card, Input, EChart, BackNavLink …
│   └── utils/           # sessionUser, dateFormat, text 헬퍼
├── index.css
└── vite-env.d.ts
```

경로 별칭 `@/`는 `src/`를 가리킵니다.

## 라우팅

`BrowserRouter` + `Routes` 조합입니다. **`/SolarWise/` base** 때문인지 아닌지는 배포 설정에 따라 달라질 수 있으니, 접속 후 주소 표시줄 경로가 맞는지 확인하세요.

```text
/                           HomePage
/about                      AboutPage
/services                   ServiceIntroductionPage
/login                      LoginPage
/signup                     SignupPage

/dashboard                  DashboardPage (DashboardSidebar 포함)
/power-forecast             PowerForecastPage
/anomaly-detection          AnomalyDetectionMainPage
/anomaly-detection/detail   AnomalyDetailPage (?eventId=)

/settings/profile           ProfileSettingsPage (DashboardSidebar 포함)
/settings/notifications     NotificationSettingsPage (DashboardSidebar 포함)

/settings                   SettingsPage — AppLayout(상단 마케팅 GNB + 사이드) 내부
```

`/settings/profile`, `/settings/notifications`는 **AppLayout 밖**에 정의되어 있으며, 페이지 내부에서 **`DashboardSidebar`**를 직접 사용합니다.

`AppLayout` 아래에는 `/settings`와 **그 외 미매칭 경로**만 들어 있습니다. 따라서 존재하지 않는 예를 들어 `/foo`는 **홈(`/`)으로 리다이렉트**되고, `/dashboard` 등은 위쪽 개별 라우트가 처리합니다.

## 주요 기능

### 마케팅 · 인증

- **홈 / 서비스 소개 / 팀 소개**: `SiteHeader` 등 공통 패턴 사용.  
- **로그인**: `POST /api/v1/auth/login` → 성공 시 `accessToken`, `user`를 `localStorage`에 저장 후 대시보드 등으로 이동.  
- **회원가입**: `POST /api/v1/auth/signup` (현재 role 등은 페이지 구현에 따름).

`apiClient`는 `Authorization: Bearer`를 자동 붙입니다. 로그아웃·세션 변경 시 `storage` 이벤트와 커스텀 `solarwise-auth-change`로 헤더/사이드바/설정 메뉴가 동기화됩니다.

### 대시보드 (`/dashboard`)

- 첫 번째 발전소를 선택해 요약 카드, 실시간 발전 차트, AI 예측 차트, SHAP 영역, 이상 목록 등을 표시합니다.  
- 사용 API: `getPlants`, `getMeasurements`, `getDashboardSummary`, `getForecast`, `getAnomalies`.  
- 계측·요약·이상은 폴링(대략 5초 간격), 예측은 더 긴 간격으로 갱신합니다.  
- API 실패 또는 데이터 부재 시 **더미 차트**로 채워 화면을 확인할 수 있게 했습니다.  
- 헤더 **알림 드롭다운**, **설정 드롭다운**(Figma 레이아웃 근처), 사이드바 상단 발전소명은 API의 등록 발전소 정보를 사용합니다.

### 이상 감지 (`/anomaly-detection`, 상세)

- 목록 필터·정렬·페이지네이션, 선택 패널, **확인(ACKNOWLEDGED)** 처리.  
- 상세: 권장 조치·XAI·타임라인 등, **확인/해결(RESOLVED)** 상태 변경.

### 발전량 예측 (`/power-forecast`)

- UI 시안 위주 페이지입니다. 예측 API와 챠트까지 연결된 플로우는 **대시보드**를 참고하면 됩니다.

### 설정 관련 페이지

| 경로 | 설명 |
|------|------|
| `/settings` | `AppLayout` 안 플레이스홀더(추후 일반 설정 확장용). |
| `/settings/profile` | 프로필 요약 카드 · 계정 정보(읽기 전용)·연결 발전소. `getSessionUser`·`useDefaultPlant`. |
| `/settings/notifications` | 이메일 알림·심각도·유형 등 UI 시안. 초기 이메일은 세션 사용자에서 가져옵니다. **저장 API는 미연결**일 수 있습니다. |

사이드바 하단 ⚙ **`DashboardSettingsMenu`**에서 **내 프로필**, **알림 설정**, **발전소 관리** 등으로 이동할 수 있습니다.

## 공통 모듈 (요약)

- `shared/utils/sessionUser.ts` — `localStorage` 사용자 파싱, 역할 라벨, 로그아웃 시 세션 정리 헬퍼  
- `shared/utils/dateFormat.ts` — `ko-KR` 날짜·시간·상대 시간  
- `shared/utils/text.ts` — 빈 문자열 대체 등  
- `shared/hooks/useDefaultPlant.ts` — `getPlants()` 후 목록과 기본 `plantId`  
- `shared/ui/BackNavLink.tsx` — 뒤로가기 스타일 링크 (프로필·이상 상세 등)

## API 엔드포인트 참고

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

CSV 업로드로 백엔드에 데이터를 넣는 절차는 **CapstoneBackend** 쪽 `data/csv/README.md`를 참고합니다. 프론트는 CSV 파일을 직접 읽지 않습니다.

## 상태 관리

전역 상태 라이브러리는 없습니다. 페이지별 `useState` / `useEffect` / `useMemo`로 관리합니다.

## 스타일

- 전역: `src/index.css`  
- 화면·컴포넌트: `*.module.css`  

## 배포 참고

- `base`가 `/SolarWise/`이므로 GitHub Pages 등 **하위 경로 배포**에 맞춰져 있습니다. 루트 도메인에 올리려면 `vite.config.ts`의 `base`를 조정해야 합니다.

## 현재 구현 요약

- 마케팅 페이지, 로그인/회원가입, 대시보드 API 연동(일부 더미 폴백), 이상 감지 목록·상세·상태 변경  
- 설정: `/settings/profile`, `/settings/notifications` UI 및 라우팅, 설정 드롭다운 연동  
- `/power-forecast`는 시안 중심  
- 알림 설정·프로필의 일부 저장/알림 API는 향후 백엔드 스펙에 맞춰 연결하면 됩니다
