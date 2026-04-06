# SolarWise Frontend Style Guide

이 문서는 SolarWise 프론트엔드의 실제 구조를 기준으로 한 작업 규칙입니다.

## 1. 기본 구조

```text
src/
├── app/
├── api/
├── features/
├── shared/
├── index.css
└── vite-env.d.ts
```

## 2. 현재 디렉토리 구조

아래 트리는 현재 `src/` 기준의 실제 구조를 요약한 것입니다.

```text
src/
├── api/
│   ├── client.ts                    # 공통 fetch 래퍼
│   └── index.ts                     # api 공개 진입점
├── app/
│   ├── App.tsx                      # 라우트 조합
│   └── main.tsx                     # React 마운트 엔트리
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   │   └── DashboardPage.tsx    # 대시보드 화면
│   │   └── index.ts                 # feature 공개 진입점
│   ├── home/
│   │   ├── components/
│   │   │   ├── HomePage.tsx         # 홈 화면
│   │   │   └── HomePage.module.css  # 홈 화면 전용 스타일
│   │   ├── hooks/
│   │   │   └── useHomeForm.ts       # 홈 화면 상태/이벤트 로직
│   │   ├── types/
│   │   │   └── home.ts              # 홈 화면 전용 타입
│   │   └── index.ts                 # feature 공개 진입점
│   └── settings/
│       ├── components/
│       │   └── SettingsPage.tsx     # 설정 화면
│       └── index.ts                 # feature 공개 진입점
├── shared/
│   ├── components/                  # 현재 비어 있음, 신규 공용 컴포넌트는 ui/layout 우선 사용
│   ├── layout/
│   │   ├── AppLayout.tsx            # 공통 앱 셸
│   │   └── AppLayout.module.css     # 레이아웃 스타일
│   ├── styles/
│   │   └── Page.module.css          # 페이지 공통 타이포/간격 스타일
│   └── ui/
│       ├── Button.tsx
│       ├── Button.module.css
│       ├── Card.tsx
│       ├── Card.module.css
│       ├── Input.tsx
│       └── Input.module.css
├── index.css                        # 전역 디자인 토큰과 리셋
└── vite-env.d.ts                    # Vite 타입 선언
```

## 3. 레이어별 책임

### `app`

- 앱 진입점, 라우팅, 전역 조합만 담당합니다.
- 비즈니스 로직이나 기능별 상태를 직접 담지 않습니다.
- 현재 파일:
  - `main.tsx`: React 앱 마운트
  - `App.tsx`: 라우트 정의 및 레이아웃 조합

### `features`

- 기능 단위로 코드를 묶습니다.
- 기본 하위 구조는 아래 중 필요한 것만 사용합니다.

```text
features/example/
├── components/
├── hooks/
├── services/
├── types/
└── index.ts
```

- `components/`: 화면과 기능 전용 UI
- `hooks/`: 상태 관리와 화면 동작 로직
- `services/`: feature 전용 가공 로직, API 호출 조합
- `types/`: feature 전용 타입
- `index.ts`: 외부에 공개할 진입점
- 현재 feature 구성:
  - `home`: 화면, hook, type이 모두 존재하는 기준 feature
  - `dashboard`: 화면 중심의 단순 feature
  - `settings`: 화면 중심의 단순 feature

### `shared`

- 여러 feature에서 함께 쓰는 공용 자원을 둡니다.

```text
shared/
├── layout/
├── styles/
└── ui/
```

- `layout/`: 앱 셸, 내비게이션, 공통 배치
- `ui/`: Button, Input, Card 같은 범용 컴포넌트
- `styles/`: 페이지 공통 스타일, 토큰 보조 스타일
- `components/`:
  현재 비어 있습니다. 새 공용 코드는 먼저 `ui` 또는 `layout`에 둘 수 있는지 검토하고, 둘 다 아닌 경우에만 별도 하위 폴더를 추가합니다.

### `api`

- 공통 API 클라이언트와 엔드포인트를 둡니다.
- `fetch` 래퍼, 인증 헤더, 에러 처리 규칙을 이곳에서 통일합니다.
- 현재 파일:
  - `client.ts`: 공통 HTTP 요청 래퍼
  - `index.ts`: 외부 노출용 엔트리

## 4. 디렉토리별 간단 설명

- `src/app`: 앱 시작점과 라우팅만 둡니다.
- `src/api`: 네트워크 호출 공통 규칙과 API 함수 진입점을 둡니다.
- `src/features`: 사용자 기능 단위 코드를 둡니다.
- `src/features/*/components`: 해당 기능에만 속한 화면 컴포넌트를 둡니다.
- `src/features/*/hooks`: 해당 기능의 상태와 이벤트 로직을 둡니다.
- `src/features/*/types`: 해당 기능의 전용 타입을 둡니다.
- `src/features/*/services`: API 호출 조합이나 데이터 가공이 커질 때 추가합니다.
- `src/features/*/index.ts`: 다른 레이어에서 import할 공개 API 역할을 합니다.
- `src/shared/layout`: 앱 전체에서 공통으로 쓰는 레이아웃을 둡니다.
- `src/shared/ui`: 범용 UI 컴포넌트를 둡니다.
- `src/shared/styles`: 여러 화면에서 공통으로 쓰는 스타일 모듈을 둡니다.
- `src/index.css`: 전역 CSS 변수와 reset 스타일을 둡니다.
- `src/vite-env.d.ts`: Vite 타입 확장을 둡니다.

## 5. 의존 규칙

- `app`은 `features`, `shared`를 조합할 수 있습니다.
- `features`는 `shared`, `api`를 사용할 수 있습니다.
- `shared`는 특정 `feature`를 참조하지 않습니다.
- 한 feature가 다른 feature의 내부 경로를 직접 참조하지 않습니다.

## 6. 구현 규칙

- 페이지가 커지면 상태 로직은 먼저 `hooks/`로 분리합니다.
- 공통성이 생기기 전까지는 `shared`로 올리지 않습니다.
- 외부에서 feature를 사용할 때는 내부 파일 경로 대신 `index.ts`를 우선 사용합니다.
- API 연동이 시작되면 컴포넌트 내부 `fetch`는 `api` 또는 feature `services`로 이동합니다.
- 새 feature를 만들 때는 최소한 `components/`와 `index.ts`부터 시작하고, 상태가 생기면 `hooks/`, 타입이 늘어나면 `types/`를 추가합니다.
