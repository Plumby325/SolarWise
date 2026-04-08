# SolarWise 프론트엔드

React + TypeScript + Vite 기반의 SolarWise 프론트엔드입니다.

## 실행 방법

```bash
npm install
npm run dev
```

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## 현재 아키텍처 구조

이 프로젝트는 React + TypeScript + Vite 기반의 단일 프론트엔드 앱이며, 현재 `app / features / shared / api` 레이어로 구조화되어 있습니다.

```text
src/
├── app/                         # 앱 진입점과 라우팅
│   ├── App.tsx                  # 전체 라우트 정의
│   └── main.tsx                 # BrowserRouter 및 React 마운트
├── api/
│   ├── client.ts                # fetch 기반 공통 API 클라이언트
│   └── index.ts                 # API 레이어 export
├── features/                    # 기능 단위 모듈
│   ├── dashboard/
│   │   ├── components/
│   │   └── index.ts
│   ├── home/
│   │   ├── components/          # 랜딩 페이지 UI
│   │   ├── hooks/               # 홈 입력 폼 상태
│   │   ├── types/               # 홈 전용 타입
│   │   └── index.ts
│   └── settings/
│       ├── components/
│       └── index.ts
├── shared/                      # 공통 레이아웃, UI, 스타일
│   ├── layout/
│   │   └── AppLayout.tsx
│   ├── styles/
│   └── ui/
├── index.css                    # 전역 스타일과 리셋
└── vite-env.d.ts
```

## 구조 요약

- `app` 레이어는 앱 초기화와 라우팅만 담당합니다.
- `src/app/main.tsx`에서 `BrowserRouter`를 연결하고 `src/app/App.tsx`에서 `/`, `/dashboard`, `/settings` 라우트를 구성합니다.
- 홈(`/`)은 `features/home`의 독립 랜딩 페이지이며, 대시보드와 설정만 `src/shared/layout/AppLayout.tsx`를 공통 레이아웃 셸로 사용합니다.
- `features`는 화면 단위 기능 모듈입니다. 현재 `home`, `dashboard`, `settings`로 분리되어 있습니다.
- `home` feature는 하나의 랜딩 페이지 안에 히어로, 지표 카드, 문제 정의, 분석 흐름, CTA, 푸터 섹션을 포함합니다.
- `home` feature는 `hooks/useHomeForm.ts`에서 주소 입력 상태와 제출값을 로컬 state로 관리합니다.
- 전역 상태 관리 라이브러리는 아직 도입되지 않았고, 상태는 각 feature 내부 훅과 React state로 관리합니다.
- `api/client.ts`에는 `fetch` 기반 공통 API 클라이언트가 있으며, 추후 엔드포인트 함수들을 이 레이어에 확장할 수 있습니다.
- 공통 UI 컴포넌트와 스타일은 `shared/ui`, `shared/styles`, CSS Modules를 중심으로 관리합니다.
- 경로 별칭 `@/`를 사용해 `src` 하위 모듈을 참조합니다.

## 라우팅 구조

```text
/              -> HomePage
/dashboard     -> AppLayout + DashboardPage
/settings      -> AppLayout + SettingsPage
*              -> / 로 리다이렉트
```

- `HomePage`는 마케팅/소개 성격의 랜딩 페이지입니다.
- `DashboardPage`, `SettingsPage`는 공통 레이아웃 안에서 동작하는 내부 화면입니다.

## 레이어 규칙

### `app`

- 앱 진입점, 라우팅, 전역 조합만 담당합니다.
- 비즈니스 로직이나 기능별 상태를 직접 두지 않습니다.

### `features`

- 사용자 기능 단위로 코드를 묶습니다.
- 기능 내부에는 `components`, `hooks`, `types`, 필요 시 `services`를 둡니다.
- 외부에서는 가능하면 각 feature의 `index.ts`를 통해 접근합니다.

### `shared`

- 특정 feature에 종속되지 않는 공용 UI와 레이아웃을 둡니다.
- 범용 컴포넌트, 공통 스타일, 레이아웃 셸만 위치시킵니다.

### `api`

- 공통 HTTP 클라이언트와 API 요청 함수를 둡니다.
- 화면 컴포넌트에서 직접 네트워크 호출이 늘어나면 이 레이어로 이동합니다.

## 현재 상태

- 홈 화면은 시안 기반 랜딩 페이지로 구현되어 있으며, feature 내부 훅으로 주소 입력 상태와 검증을 분리했습니다.
- 대시보드와 설정 화면은 현재 기본 페이지 구조 중심으로 준비되어 있습니다.
- 공통 레이아웃과 공용 UI 컴포넌트는 `shared` 레이어에서 재사용합니다.
- 백엔드 구현은 이 저장소에 포함되어 있지 않으며, API 명세는 루트의 `API.md` 문서를 참고합니다.
