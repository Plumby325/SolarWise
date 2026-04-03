# SolarWise Frontend Style Guide (Vite + React)

이 문서는 현재 `SolarWise` 프로젝트의 **실제 코드 구조**를 기준으로 작성한 스타일 가이드입니다.
다른 프레임워크(예: Next.js App Router) 기준 문서는 적용하지 않습니다.

## 1. 아키텍처 원칙

- `app`: 앱 실행 진입점과 라우팅 조합
- `features`: 기능 단위 UI/로직 모듈
- `shared`: 기능에 종속되지 않는 공통 컴포넌트/스타일
- `api`: 서버 통신 계층 (현재 확장 예정)

의존성 방향 원칙:
- `app -> features -> shared`
- `features -> shared`
- `shared`는 `features`를 참조하지 않음

## 2. 현재 표준 디렉토리 구조

```text
src/
├── app/
│   ├── main.tsx                      # Vite 엔트리 (React mount)
│   └── App.tsx                       # 라우트 조합
│
├── features/
│   ├── home/
│   │   └── presentation/
│   │       └── components/
│   │           ├── HomePage.tsx
│   │           └── HomePage.module.css
│   ├── dashboard/
│   │   └── presentation/
│   │       └── components/
│   │           └── DashboardPage.tsx
│   └── settings/
│       └── presentation/
│           └── components/
│               └── SettingsPage.tsx
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   └── AppLayout.module.css
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Button.module.css
│   │       ├── Card.tsx
│   │       ├── Card.module.css
│   │       ├── Input.tsx
│   │       └── Input.module.css
│   └── styles/
│       └── Page.module.css
│
├── api/                              # API 통신 코드 추가 예정
├── index.css                         # 전역 스타일 토큰/리셋
└── vite-env.d.ts
```

## 3. app 레이어 규칙

### 3.1 `src/app/main.tsx`
역할:
- React DOM mount
- 라우터/Provider 연결
- 전역 CSS import

규칙:
- 비즈니스 로직 작성 금지
- 화면 컴포넌트 직접 작성 금지
- 앱 초기화 코드만 배치

### 3.2 `src/app/App.tsx`
역할:
- 라우트 트리 정의
- 공통 레이아웃 연결

규칙:
- API 호출 금지
- 복잡한 상태 로직 금지
- 페이지 조합 전용

## 4. feature 레이어 규칙

현재는 `presentation` 중심으로 운영합니다.

```text
features/{feature}/presentation/components
```

각 파일 역할:
- `*Page.tsx`: 기능 화면 컴포넌트
- `*.module.css`: 해당 화면 전용 스타일

향후 복잡도 증가 시 다음 구조로 확장:

```text
features/{feature}/
├── domain/
├── application/
└── presentation/
```

확장 기준:
- 순수 비즈니스 규칙 분리 필요 -> `domain`
- 커스텀 훅/상태 orchestration 필요 -> `application`
- 화면 렌더링 전용 -> `presentation`

## 5. shared 레이어 규칙

### 5.1 `shared/components/ui`
- 버튼/입력/카드처럼 재사용 가능한 순수 UI
- 특정 feature 문맥(예: 주문, 회원 등)을 몰라야 함

### 5.2 `shared/components/layout`
- 앱 공통 레이아웃 (헤더/사이드바/푸터)

### 5.3 `shared/styles`
- 여러 feature에서 재사용하는 스타일 모듈
- 예: `Page.module.css`

금지:
- `shared`에서 `features` import

## 6. import 규칙

`@` alias를 기본으로 사용합니다.

설정:
- `tsconfig.app.json`: `@/* -> src/*`
- `vite.config.ts`: `@: '/src'`

권장:
- `import { AppLayout } from '@/shared/components/layout/AppLayout'`
- `import { HomePage } from '@/features/home/presentation/components/HomePage'`

예외:
- 같은 폴더 내 파일은 상대경로 허용

## 7. 네이밍 규칙

- 컴포넌트 파일: PascalCase (`HomePage.tsx`, `AppLayout.tsx`)
- 스타일 모듈: 컴포넌트명 + `.module.css`
- 훅: `use` 접두사 + camelCase (`useAuth.ts`)
- 변수/함수: camelCase
- 상수: SCREAMING_SNAKE_CASE
- Props 타입: `컴포넌트명 + Props`

약어 지침:
- 허용: `id`, `url`, `api`, `ui`
- 지양: `req`, `res`, `btn`, `img`, `idx`

## 8. 스타일링 규칙

- 기본: CSS Modules (`*.module.css`)
- 전역 토큰/리셋: `src/index.css`
- 컴포넌트별 스타일은 해당 컴포넌트 옆에 배치
- 공통 패턴 스타일은 `shared/styles`로 올림

권장 순서:
1. 레이아웃
2. 박스 모델
3. 타이포
4. 시각(색/배경/테두리)
5. 애니메이션/전환

## 9. API 계층 규칙 (추가 시)

```text
src/api/
├── client.ts
└── endpoints/
    ├── auth.ts
    ├── dashboard.ts
    └── settings.ts
```

규칙:
- 모든 API 호출은 `api/endpoints/*` 함수로 캡슐화
- 컴포넌트에서 `fetch`/`axios` 직접 호출 금지
- 공통 응답 타입은 `shared/types`로 분리

## 10. 구현 체크리스트

새 기능 추가 시:
- [ ] `features/{name}/presentation/components` 생성
- [ ] `*Page.tsx` + `*.module.css` 생성
- [ ] `src/app/App.tsx` 라우트 등록
- [ ] 공통 UI 재사용 가능성 검토 (`shared/components/ui`)
- [ ] 중복 스타일은 `shared/styles`로 승격

PR 전 확인:
- [ ] `npm run build` 통과
- [ ] import alias(`@`) 경로 오류 없음
- [ ] `shared -> features` 역참조 없음
- [ ] 사용하지 않는 코드/스타일 제거

## 11. 이 프로젝트에서 명확히 구분할 점

- `src/app/main.tsx`는 **페이지 파일이 아니라 엔트리 파일**입니다.
- `src/app/App.tsx`는 **라우트 조합 파일**입니다.
- 실제 화면 단위는 `src/features/*/presentation/components/*Page.tsx`입니다.

이 기준을 SolarWise의 기본 규칙으로 사용합니다.
