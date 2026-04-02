# SolarWise 프론트엔드

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구 / 개발 서버)
- **React Router v6** (페이지 라우팅)
- **CSS Modules** (컴포넌트별 스타일 격리)
- **ESLint** (코드 품질 검사)

---

## 실행 방법

```bash
npm install
npm run dev
```

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (기본 `http://localhost:5173`) |
| `npm run build` | 타입 체크 + 배포용 빌드 (`dist/` 생성) |
| `npm run lint` | ESLint 코드 검사 |
| `npm run preview` | 빌드 결과물 미리보기 |

---

## 폴더 구조

```
SolarWise/
├── public/
│   └── vite.svg                    # 브라우저 탭 아이콘
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # 공통 레이아웃 (헤더·사이드바·본문·푸터)
│   │   │   └── AppLayout.module.css
│   │   └── ui/
│   │       ├── Button.tsx          # 버튼 컴포넌트
│   │       ├── Button.module.css
│   │       ├── Input.tsx           # 입력 필드 컴포넌트
│   │       ├── Input.module.css
│   │       ├── Card.tsx            # 카드 컴포넌트
│   │       └── Card.module.css
│   ├── pages/
│   │   ├── HomePage.tsx            # 홈 (UI 컴포넌트 데모)
│   │   ├── DashboardPage.tsx       # 대시보드 (placeholder)
│   │   ├── SettingsPage.tsx        # 설정 (placeholder)
│   │   └── Pages.module.css        # 페이지 공통 스타일
│   ├── App.tsx                     # 라우트 정의
│   ├── main.tsx                    # 앱 진입점
│   ├── index.css                   # 전역 스타일 & 디자인 토큰
│   └── vite-env.d.ts               # Vite 타입 선언
├── index.html                      # SPA 유일 HTML
├── package.json                    # 의존성 & 스크립트
├── vite.config.ts                  # Vite 설정
├── tsconfig.json                   # TypeScript 설정 (루트)
├── tsconfig.app.json               # TypeScript 설정 (브라우저 코드)
├── tsconfig.node.json              # TypeScript 설정 (빌드 도구)
├── eslint.config.js                # ESLint 설정
├── Dockerfile                      # Docker 컨테이너 설정
└── .gitignore                      # Git 제외 목록
```

---

## 파일별 설명

### 프로젝트 설정 파일 (루트)

| 파일 | 설명 |
|------|------|
| `package.json` | 프로젝트 이름·버전, 실행 스크립트(`dev`, `build`, `lint`), 의존 라이브러리 목록을 정의한다. |
| `vite.config.ts` | Vite 빌드 도구 설정. `react()` 플러그인을 등록해 JSX 문법을 처리한다. |
| `tsconfig.json` | TypeScript 설정의 루트 파일. 아래 두 파일을 참조만 한다. |
| `tsconfig.app.json` | `src/` 폴더(브라우저 코드) 대상 TS 설정. `jsx: react-jsx`, `strict: true` 등 핵심 옵션이 들어 있다. |
| `tsconfig.node.json` | `vite.config.ts`(Node 환경) 대상 TS 설정. DOM 타입 없이 빌드 도구만 다룬다. |
| `eslint.config.js` | 코드 품질 검사 설정. React Hooks 규칙, 핫 리로드 호환성 규칙을 포함한다. |
| `index.html` | 앱 전체의 유일한 HTML. `<div id="root">`에 React가 UI를 렌더링한다. |
| `.gitignore` | `node_modules`, `dist`, `.env` 등 Git에 올리지 않을 파일·폴더 목록. |
| `Dockerfile` | Docker 컨테이너 빌드 레시피. Node 24 Alpine 기반으로 개발 서버를 띄운다. |

### 앱 소스 (`src/`)

| 파일 | 설명 |
|------|------|
| `main.tsx` | **앱 진입점.** `index.html`의 `#root`에 React를 마운트한다. `StrictMode`(개발 경고)와 `BrowserRouter`(URL 라우팅)로 앱을 감싼다. |
| `App.tsx` | **라우트 정의.** URL별로 어떤 페이지를 보여줄지 매핑한다. 모든 페이지를 `AppLayout`으로 감싸 공통 레이아웃을 적용한다. 정의되지 않은 URL은 `/`로 리다이렉트한다. |
| `index.css` | **전역 스타일 & 디자인 토큰.** CSS 변수(`--color-*`, `--space-*`, `--radius-*`)로 색상·간격·반경을 한곳에 모았다. 피그마 확정 시 변수 값만 바꾸면 전체 반영된다. 브라우저 기본 스타일 리셋도 포함. |
| `vite-env.d.ts` | Vite 전용 타입 선언. `.svg` 임포트 등을 TypeScript가 인식하게 한다. |

### 공통 레이아웃 (`src/components/layout/`)

| 파일 | 설명 |
|------|------|
| `AppLayout.tsx` | **모든 페이지에 공통으로 나타나는 껍데기(Shell).** 헤더(브랜드 로고 + 모바일 탭), 사이드바(데스크톱 내비게이션), 본문(`<Outlet />`), 푸터로 구성된다. `navItems` 배열에 메뉴를 추가하면 헤더·사이드바에 동시 반영된다. `NavLink`가 현재 URL과 일치하면 활성 스타일을 자동 적용한다. |
| `AppLayout.module.css` | 레이아웃 스타일. **768px 미만(모바일):** 사이드바 숨김, 헤더에 가로 탭 표시. **768px 이상(데스크톱):** 헤더 탭 숨김, 사이드바 표시. CSS Modules로 클래스명 자동 격리. |

### UI 컴포넌트 (`src/components/ui/`)

| 파일 | 설명 |
|------|------|
| `Button.tsx` | **범용 버튼.** `variant` prop으로 3가지 스타일 선택: `primary`(파란 채움), `secondary`(테두리), `ghost`(투명). HTML `<button>`의 모든 속성(`onClick`, `disabled` 등)을 그대로 지원한다. |
| `Button.module.css` | 버튼 스타일. variant별 색상, hover 효과, disabled 시 반투명 처리, 0.15초 전환 애니메이션. |
| `Input.tsx` | **라벨 + 입력 필드 + 에러 메시지를 묶은 컴포넌트.** `useId()`로 고유 id를 자동 생성해 `<label>`과 `<input>`을 연결한다. `error` prop에 문자열을 주면 빨간 에러 메시지와 빨간 테두리가 나타난다. `aria-invalid`, `aria-describedby`로 스크린 리더 접근성을 지원한다. |
| `Input.module.css` | 입력 필드 스타일. focus 시 파란 외곽선, 에러 시 빨간 외곽선, placeholder 색상, disabled 처리. |
| `Card.tsx` | **콘텐츠를 감싸는 카드.** `title` prop이 있으면 어두운 헤더 영역이 위에 나타나고, 없으면 본문만 표시된다. `children`으로 안에 무엇이든 넣을 수 있다. |
| `Card.module.css` | 카드 스타일. 둥근 모서리, 테두리, 헤더/본문 영역 분리. |

### 페이지 (`src/pages/`)

| 파일 | 설명 |
|------|------|
| `HomePage.tsx` | **홈 페이지 (UI 데모).** `useState`로 입력값과 에러 상태를 관리한다. Button·Input·Card 컴포넌트를 실제 사용해 볼 수 있다. 폼 제출 시 빈 값이면 에러 메시지를 표시한다. |
| `DashboardPage.tsx` | **대시보드 placeholder.** 제목과 안내 문구만 존재. 이후 목 데이터·차트를 채울 예정. |
| `SettingsPage.tsx` | **설정 placeholder.** 제목과 안내 문구만 존재. API 스펙 확정 후 폼·토글을 추가할 예정. |
| `Pages.module.css` | 페이지 공통 스타일. 최대 폭 720px, 제목·설명·그리드·행·폼 레이아웃. |

---

## 데이터 흐름

```
브라우저가 index.html 로드
  → main.tsx 실행
    → BrowserRouter (URL 감시 시작)
      → App.tsx (URL에 맞는 Route 선택)
        → AppLayout (헤더·사이드바·푸터 렌더링)
          → <Outlet /> 자리에 HomePage / DashboardPage / SettingsPage 끼워 넣기
```

---

## 핵심 React 개념 정리

| 개념 | 설명 |
|------|------|
| **컴포넌트** | UI를 재사용 가능한 함수 단위로 쪼갠 것. `Button`, `Card` 등이 각각 하나의 컴포넌트. |
| **props** | 부모 → 자식 컴포넌트로 전달하는 데이터. `<Button variant="ghost">`에서 `variant`가 prop. |
| **children** | `<Button>텍스트</Button>`에서 "텍스트" 부분. 컴포넌트 태그 사이에 넣은 내용. |
| **useState** | 컴포넌트 안에서 변하는 값을 기억하는 Hook. 값이 바뀌면 화면이 자동 재렌더링된다. |
| **useId** | 고유 id를 자동 생성하는 Hook. `<label>`과 `<input>` 연결 등에 사용. |
| **JSX** | JavaScript 안에서 HTML처럼 쓰는 문법. `<div className={styles.card}>` 같은 것. |
| **CSS Modules** | `.module.css` 파일의 클래스명이 자동으로 고유하게 변환되어 스타일 충돌을 방지한다. |
| **NavLink** | React Router의 링크 컴포넌트. 현재 URL과 일치하면 `isActive`가 true가 되어 활성 스타일 적용. |
| **Outlet** | 레이아웃 라우트 안에서 "자식 라우트의 컴포넌트를 여기에 그려라"는 빈 칸 역할. |
| **`...rest` (spread)** | 명시적으로 꺼내지 않은 나머지 props를 그대로 HTML 요소에 전달하는 문법. |

---

## 다음 단계 (TODO)

- [ ] 목(mock) 데이터 작성 (JSON / TypeScript 상수)
- [ ] API 함수 레이어 분리 (`src/api/` 또는 `src/services/`)
- [ ] 대시보드 페이지: 요약 카드 + 더미 차트
- [ ] 발전량 목록 페이지: 테이블 + 정렬/페이지네이션
- [ ] 로그인/회원가입 페이지: 폼 + 유효성 검사
- [ ] 로딩 / 에러 / 빈 상태 공통 컴포넌트
- [ ] 피그마 확정 시 디자인 토큰(`index.css` 변수) 교체
- [ ] 백엔드 API 연동 시 목 데이터 → 실제 fetch 전환
