# SolarWise 프론트엔드

React + TypeScript + Vite 기반의 SolarWise 프론트엔드입니다. 현재는 랜딩 페이지, 로그인/회원가입 화면, 대시보드/설정 기본 화면까지 포함한 단일 SPA 구조로 되어 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

기본 개발 서버 주소:

```text
http://localhost:5173
```

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## Docker 실행 방법

Docker Desktop 실행 후 프로젝트 루트에서 아래 명령을 실행합니다.

```bash
docker build -t solarwise .
docker run --rm -p 5173:5173 solarwise
```

접속 주소:

```text
http://localhost:5173
```

## 현재 아키텍처 구조

이 프로젝트는 `app / features / shared / api` 구조를 기준으로 구성되어 있습니다.

```text
src/
├── app/                         # 앱 진입점과 라우팅
│   ├── App.tsx
│   └── main.tsx
├── api/                         # 공통 API 클라이언트
│   ├── client.ts
│   └── index.ts
├── features/                    # 화면 단위 기능 모듈
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
│   ├── settings/
│   │   ├── components/
│   │   └── index.ts
│   └── signup/
│       ├── components/
│       └── index.ts
├── shared/                      # 공통 레이아웃, UI, 스타일
│   ├── layout/
│   ├── styles/
│   └── ui/
├── index.css                    # 전역 스타일
└── vite-env.d.ts
```

## 라우팅 구조

`src/app/main.tsx`에서 `BrowserRouter`를 연결하고, `src/app/App.tsx`에서 라우트를 정의합니다.

```text
/              -> HomePage
/login         -> LoginPage
/signup        -> SignupPage
/dashboard     -> AppLayout + DashboardPage
/settings      -> AppLayout + SettingsPage
*              -> / 로 리다이렉트
```

- `/`, `/login`, `/signup`은 공통 레이아웃 없이 동작하는 독립 페이지입니다.
- `/dashboard`, `/settings`만 `shared/layout/AppLayout.tsx` 안에서 렌더링됩니다.

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

- `home`: 랜딩 페이지. 히어로, 소개 섹션, CTA, 푸터 등 마케팅 성격의 UI를 포함합니다.
- `login`: 로그인 화면. 이메일/비밀번호 입력 검증 후 `/dashboard`로 이동합니다.
- `signup`: 회원가입 화면. 이름/이메일/비밀번호/보유 상태 입력 검증 후 `/dashboard`로 이동합니다.
- `dashboard`: 대시보드 기본 화면입니다.
- `settings`: 설정 기본 화면입니다.

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

## 현재 구현 상태

- 홈 화면은 독립 랜딩 페이지로 구현되어 있습니다.
- 로그인/회원가입 화면은 클라이언트 검증 중심의 UI로 구현되어 있습니다.
- 대시보드와 설정은 현재 플레이스홀더 수준의 기본 화면입니다.
- 공통 레이아웃은 대시보드와 설정에만 적용됩니다.
- 백엔드 API 명세는 루트의 `API.md`를 참고할 수 있지만, 현재 프론트엔드에서는 공통 `apiClient`만 준비된 상태입니다.
