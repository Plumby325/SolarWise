# SolarWise 프론트엔드

React + TypeScript + Vite 기반의 SolarWise 프론트엔드입니다. 현재는 메인 랜딩 페이지, 서비스 소개 페이지, 팀 소개 페이지, 로그인/회원가입, 대시보드/설정 기본 화면까지 포함한 단일 SPA 구조입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router DOM
- CSS Modules

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

개발 서버 기본 주소:

```text
http://localhost:5173
```

## Docker 실행 방법

Docker Desktop 실행 후 프로젝트 루트에서 아래 명령을 실행합니다.

```bash
docker build -t solarwise .
docker run --rm -p 5173:5173 solarwise
```

## 프로젝트 구조

이 프로젝트는 `app / features / shared / api` 구조를 기준으로 구성되어 있습니다.

```text
src/
├── app/                               # 앱 진입점과 라우팅
│   ├── App.tsx
│   └── main.tsx
├── api/                               # 공통 API 클라이언트
│   ├── client.ts
│   └── index.ts
├── features/                          # 화면 단위 기능 모듈
│   ├── about/
│   │   ├── components/
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── components/
│   │   └── index.ts
│   ├── home/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   ├── login/
│   │   ├── components/
│   │   └── index.ts
│   ├── service-introduction/
│   │   ├── components/
│   │   └── index.ts
│   ├── settings/
│   │   ├── components/
│   │   └── index.ts
│   └── signup/
│       ├── components/
│       └── index.ts
├── shared/                            # 공통 레이아웃, UI, 스타일
│   ├── layout/
│   ├── styles/
│   └── ui/
├── index.css                          # 전역 스타일
└── vite-env.d.ts
```

## 라우팅 구조

`src/app/main.tsx`에서 `BrowserRouter`를 연결하고, `src/app/App.tsx`에서 라우트를 정의합니다.

```text
/              -> HomePage
/about         -> AboutPage
/services      -> ServiceIntroductionPage
/login         -> LoginPage
/signup        -> SignupPage
/dashboard     -> AppLayout + DashboardPage
/settings      -> AppLayout + SettingsPage
*              -> / 로 리다이렉트
```

- `/`, `/about`, `/services`, `/login`, `/signup`은 공통 레이아웃 없이 동작하는 독립 페이지입니다.
- `/dashboard`, `/settings`만 `shared/layout/AppLayout.tsx` 안에서 렌더링됩니다.

## 주요 페이지

### `HomePage`

- 메인 랜딩 페이지입니다.
- 히어로, 문제 정의, 핵심 기능 소개, 시작 흐름, CTA, 푸터를 포함합니다.
- 상단 메뉴를 통해 서비스 소개, 대시보드, 팀 소개 페이지로 이동할 수 있습니다.

### `ServiceIntroductionPage`

- 서비스 기능을 자세히 설명하는 전용 소개 페이지입니다.
- 5가지 핵심 기능을 각각 독립 섹션으로 소개합니다.
  - 실시간 발전량 트래킹
  - AI 발전량 예측
  - AI 패널 이상 감지
  - XAI 설명 리포트
  - 예지 정비 알림
- XAI 설명 리포트는 그래프 대신 채팅형 설명 UI로, 발생한 문제와 그 이유를 자연어로 보여주도록 구성되어 있습니다.

### `AboutPage`

- 팀 및 프로젝트 소개 페이지입니다.
- 팀 소개, 프로젝트 배경, 기술 스택, 협력기업 정보, CTA를 포함합니다.

### `LoginPage` / `SignupPage`

- 클라이언트 입력 검증 중심의 인증 UI입니다.
- 현재는 폼 검증과 화면 흐름 중심으로 구현되어 있으며, 성공 시 `/dashboard`로 이동합니다.

### `DashboardPage` / `SettingsPage`

- 현재는 기본 레이아웃 확인용 화면입니다.
- `AppLayout` 안에서 렌더링되며 이후 실제 데이터 화면으로 확장할 수 있는 구조입니다.

## 레이어 설명

### `app`

- 앱 진입점과 라우팅만 담당합니다.
- `main.tsx`에서 React 앱을 마운트하고 `BrowserRouter`를 연결합니다.
- `App.tsx`에서 전체 페이지 라우트를 조합합니다.

### `features`

- 사용자 기능 단위로 화면을 나눕니다.
- 각 feature는 자체 `components`와 필요 시 `hooks`, `types`를 가집니다.
- 외부에서는 각 feature의 `index.ts`를 통해 페이지를 가져옵니다.

현재 feature 구성:

- `home`: 메인 랜딩 페이지
- `service-introduction`: 서비스 상세 소개 페이지
- `about`: 팀 및 프로젝트 소개 페이지
- `login`: 로그인 화면
- `signup`: 회원가입 화면
- `dashboard`: 대시보드 기본 화면
- `settings`: 설정 기본 화면

### `shared`

- 여러 feature에서 재사용하는 공통 레이어입니다.
- `shared/layout/AppLayout.tsx`에 상단 헤더, 사이드바, `Outlet`, 푸터가 들어 있습니다.
- `shared/ui`에는 `Button`, `Card`, `Input` 같은 공용 UI 컴포넌트가 있습니다.
- `shared/styles/Page.module.css`는 기본 페이지 레이아웃 스타일에 사용됩니다.

### `api`

- 공통 HTTP 호출 유틸을 담당합니다.
- 현재 `api/client.ts`에는 `fetch` 기반 `apiClient<T>()`만 있습니다.
- 아직 각 feature에서 도메인별 API 모듈을 사용하고 있지는 않습니다.

## 상태 관리

- 전역 상태 관리 라이브러리는 아직 사용하지 않습니다.
- 홈 화면은 `features/home/hooks/useHomeForm.ts`에서 로컬 폼 상태를 관리합니다.
- 로그인/회원가입 화면은 각 페이지 컴포넌트 내부 `useState`로 입력값과 검증 상태를 관리합니다.

## 스타일링

- 전역 스타일은 `src/index.css`에 있습니다.
- 페이지와 컴포넌트 스타일은 CSS Modules(`*.module.css`)로 관리합니다.
- 경로 별칭 `@/`를 사용해 `src` 하위 모듈을 참조합니다.
- Figma 시안을 기반으로 한 마케팅 페이지들은 CSS Modules 안에서 페이지별 스타일을 독립적으로 관리합니다.

## 현재 구현 상태

- 메인 랜딩 페이지(`/`)가 구현되어 있습니다.
- 서비스 소개 페이지(`/services`)가 구현되어 있습니다.
- 팀 소개 페이지(`/about`)가 구현되어 있습니다.
- 로그인/회원가입 화면은 클라이언트 검증 중심의 UI로 구현되어 있습니다.
- 대시보드와 설정은 현재 플레이스홀더 수준의 기본 화면입니다.
- 공통 레이아웃은 대시보드와 설정에만 적용됩니다.
- 백엔드 API 명세는 루트의 `API.md`를 참고할 수 있지만, 현재 프론트엔드에서는 공통 `apiClient`만 준비된 상태입니다.
