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

## 아키텍처

이 프로젝트는 `app / features / shared / api` 구조를 기본 규칙으로 사용합니다.

```text
src/
├── app/                   # 앱 진입점, 라우팅, 전역 조합
├── api/                   # 공통 API 클라이언트와 엔드포인트
├── features/              # 기능 단위 화면/훅/서비스/타입
│   ├── dashboard/
│   │   ├── components/
│   │   └── index.ts
│   ├── home/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   └── settings/
│       ├── components/
│       └── index.ts
├── shared/                # 범용 레이아웃, UI, 스타일
│   ├── layout/
│   ├── styles/
│   └── ui/
├── index.css              # 전역 토큰과 리셋
└── vite-env.d.ts
```

## 레이어 규칙

### `app`

- 라우팅, 전역 레이아웃, 앱 초기화만 담당합니다.
- 기능별 상태나 비즈니스 로직을 직접 두지 않습니다.

### `features`

- 사용자 기능 단위로 코드를 묶습니다.
- 기능 내부에서는 필요에 따라 `components`, `hooks`, `services`, `types`를 둡니다.
- 다른 feature의 내부 파일을 직접 참조하지 않고, 가능하면 각 feature의 `index.ts`를 통해 노출합니다.

### `shared`

- 특정 feature에 종속되지 않는 공용 UI와 레이아웃을 둡니다.
- 범용 컴포넌트, 공통 스타일, 레이아웃 셸만 위치시킵니다.

### `api`

- 공통 HTTP 클라이언트와 API 요청 함수를 둡니다.
- 화면 컴포넌트에서 직접 `fetch` 호출이 늘어나면 이 레이어로 이동합니다.

## 현재 상태

- 홈 화면은 feature 내부 `hook`으로 폼 상태를 분리했습니다.
- 대시보드와 설정은 화면 뼈대만 준비된 상태입니다.
- 공통 레이아웃과 UI 컴포넌트는 `shared`에서 재사용합니다.
