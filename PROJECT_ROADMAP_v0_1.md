# Decision Pack Platform — Project Roadmap v0.1

**작성일**: 2026-02-09
**목적**: Phase 단위 Mini Task 로드맵 (협업 프로토콜 v2.0 적용)
**DoD**: Wizard → Run 생성 → 상태 전환 → 다운로드 → Manifest → Smoke Test 5종 통과

---

## 📋 Phase Overview

| Phase | Milestone | 핵심 목표 | 예상 소요 | 통과 TC |
|---|---|---|---|---|
| **Phase 0** | 프로젝트 초기화 | Next.js 16.x 프로젝트 설정 | 30분 | — |
| **Phase 1** | MS-1 Skeleton | Routes + Layout + Dashboard | 1.5시간 | TC-SMK-01, 06 |
| **Phase 2** | MS-2 Wizard | W0~W4 + Progressive Disclosure | 3시간 | TC-SMK-02, 03 |
| **Phase 3** | MS-3 Run Flow | Mock API + 상태머신 + 폴링 | 2.5시간 | TC-SMK-04, 05 |
| **Phase 4** | MS-4 Log/Manifest | Manifest Viewer + Telemetry | 1.5시간 | TC-SMK-07 |
| **Phase 5** | MS-5 Polish | A11y + 보안 + Final DoD | 1시간 | TC-SMK-08, ALL |

**Total**: ~10시간 (순수 구현 시간, 디버깅/회고 제외)

---

## 🚀 Phase 0: 프로젝트 초기화

**목표**: Next.js 16.x + React 19.x + TypeScript 프로젝트 설정 완료

### **협업 프로토콜 (Phase 0 시작 전)**
```markdown
전체 목표: Decision Pack Platform Prototype v0.1 구현
검증 책임: 브라우저 확인은 사용자, 코드 품질은 Claude
포기 기준: 동일 에러 2회 반복 시 즉시 대안 제시
```

### **Mini Tasks**

#### **MT-0.1: Next.js 프로젝트 생성** (필수)
**핵심**: App Router 사용, TypeScript 필수, Tailwind CSS 포함
```bash
# 권장 명령어
npx create-next-app@latest dpp-v2-fe \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**검증**:
- [ ] `package.json`에 `next@^16.0.0`, `react@^19.0.0` 확인
- [ ] `tsconfig.json` strict 모드 활성화
- [ ] `npm run dev` 실행 → `localhost:3000` 접속 성공

**포기 기준**: 설치 실패 2회 → Node 버전 확인 또는 수동 설정 제안

---

#### **MT-0.2: 폴더 구조 생성** (필수)
**핵심**: CLAUDE.md에 명시된 구조 그대로 생성
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # shadcn/ui (추후)
│   └── shared/            # 공통 컴포넌트
├── features/
│   ├── wizard/
│   └── run/
├── lib/
│   ├── mockApi.ts
│   ├── storage.ts
│   ├── validators.ts
│   └── telemetry.ts
└── contracts/
    ├── run.ts
    ├── manifest.ts
    ├── errorCodes.ts
    └── constants.ts
```

**검증**:
- [ ] `tree src/` 또는 `ls -R src/` 실행 → 구조 확인
- [ ] 각 폴더에 `.gitkeep` 파일 생성 (빈 폴더 커밋용)

**포기 기준**: N/A (폴더 생성은 실패 없음)

---

#### **MT-0.3: ESLint + Prettier 설정** (필수)
**핵심**: Flat Config, React 19 규칙, eval/innerHTML 금지

**작업**:
1. `eslint.config.js` 생성 (Flat Config)
2. `.prettierrc` 생성
3. `package.json`에 스크립트 추가:
   ```json
   "scripts": {
     "format": "prettier --write \"src/**/*.{ts,tsx}\"",
     "lint": "next lint",
     "typecheck": "tsc --noEmit"
   }
   ```

**검증**:
- [ ] `npm run lint` → 0 errors
- [ ] `npm run format` → 파일 정리 완료
- [ ] `npm run typecheck` → 0 errors

**포기 기준**: ESLint 설정 충돌 2회 → 최소 설정으로 우회

---

#### **MT-0.4: 환경 변수 템플릿** (필수)
**핵심**: `.env.example` 작성, 실제 `.env`는 `.gitignore`

**`.env.example`**:
```bash
# Mock API 모드 (v0.1은 항상 true)
NEXT_PUBLIC_MOCK_MODE=true

# 폴링 간격 (밀리초)
NEXT_PUBLIC_POLL_INTERVAL=5000

# 파일 업로드 제한
NEXT_PUBLIC_MAX_FILE_SIZE=52428800      # 50MB
NEXT_PUBLIC_MAX_TOTAL_SIZE=157286400    # 150MB
NEXT_PUBLIC_MAX_URL_COUNT=30
```

**검증**:
- [ ] `.env.example` 파일 존재
- [ ] `.gitignore`에 `.env`, `.env.local` 등 포함 확인

**포기 기준**: N/A

---

#### **MT-0.5: Git 초기화 + GitHub 연결 + 첫 커밋** (필수)
**핵심**: GitHub 저장소 연결 + CLAUDE.md, settings.json 포함 첫 커밋

**GitHub 저장소**: `ghilp934/DPP_prototype_ver_0_1` (사전 생성 완료)

**작업**:
```bash
# 1. Git 초기화
git init

# 2. GitHub 저장소 연결
git remote add origin https://github.com/ghilp934/DPP_prototype_ver_0_1.git

# 3. 현재 브랜치 이름 확인/변경 (main으로 통일)
git branch -M main

# 4. 첫 커밋
git add .
git commit -m "chore: initial project setup (Next.js 16 + React 19 + TS)

- Next.js 16.x with App Router
- React 19.x with new JSX transform
- TypeScript strict mode
- Tailwind CSS 3.x
- ESLint Flat Config + Prettier
- Folder structure per CLAUDE.md
- LOCK register + Milestones + DoD
- Mock API strategy (LocalStorage + In-Memory)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 5. GitHub에 푸시
git push -u origin main
```

**검증**:
- [ ] `git log -1` → 첫 커밋 확인
- [ ] `git remote -v` → origin 연결 확인
- [ ] GitHub 웹에서 `ghilp934/DPP_prototype_ver_0_1` 저장소 확인 → 파일 업로드 확인

**포기 기준**:
- Git push 권한 오류 → 사용자에게 GitHub 인증 요청
- 네트워크 오류 2회 → 로컬 커밋만 유지 후 수동 push 안내

---

### **Phase 0 완료 체크리스트**
- [ ] Next.js 16.x + React 19.x 설치 완료
- [ ] 폴더 구조 생성 완료
- [ ] ESLint + Prettier 설정 완료
- [ ] `.env.example` 작성 완료
- [ ] Git 초기화 + GitHub 연결 완료 (`ghilp934/DPP_prototype_ver_0_1`)
- [ ] 첫 커밋 + Push 완료 (GitHub 웹에서 확인)
- [ ] `npm run dev` 실행 → `localhost:3000` 정상 동작
- [ ] `npm run lint && npm run typecheck` → 0 errors

**다음 Phase**: Phase 1 (MS-1 Skeleton)

---

## 🏗️ Phase 1: MS-1 Skeleton

**목표**: Routes + Layout + Constants + Dashboard + Policy 페이지
**통과 TC**: TC-SMK-01 (route access), TC-SMK-06 (policy disclosure)

### **협업 프로토콜 (Phase 1 시작 전)**
```markdown
핵심 우선순위:
1. Routes 생성 (필수) — /, /app, /app/new, /policies
2. Layout 컴포넌트 (필수) — Header + Footer
3. Dashboard 기본 UI (필수) — "새 Run" 버튼만
4. Policy 페이지 (필수) — AI 고지 + 환불 정책 표시
5. Constants 정의 (필수) — src/contracts/constants.ts

선택 작업:
- shadcn/ui 설치 (MS-2에서 해도 됨)
- 스타일링 완성도 (기본만 OK)

검증 방법:
- 브라우저에서 각 라우트 접속 (사용자)
- Lint/Typecheck (Claude)
```

### **Mini Tasks**

#### **MT-1.1: Routes 생성** (필수)
**핵심**: App Router 기반, 각 라우트는 `page.tsx`로 정의

**작업**:
```
src/app/
├── page.tsx                 # Landing (/)
├── app/
│   ├── page.tsx            # Dashboard (/app)
│   ├── new/
│   │   └── page.tsx        # Wizard (/app/new)
│   ├── run/
│   │   └── [runId]/
│   │       ├── page.tsx    # Run 상세 (/app/run/:runId)
│   │       └── log/
│   │           └── page.tsx # Log (/app/run/:runId/log)
│   └── pay/
│       └── [runId]/
│           └── page.tsx    # Payment (/app/pay/:runId)
└── policies/
    └── page.tsx            # Policies (/policies)
```

**각 페이지 초기 내용** (예시):
```tsx
// src/app/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Decision Pack Platform</h1>
      <p className="mt-4">근거가 붙은 의사결정 패키지 생성 플랫폼</p>
      <a href="/app" className="mt-4 inline-block text-blue-600">
        Dashboard로 이동 →
      </a>
    </main>
  );
}
```

**검증**:
- [ ] 브라우저에서 `/`, `/app`, `/app/new`, `/policies` 접속 → 404 없음 (TC-SMK-01)
- [ ] 각 페이지에 제목/설명 표시 확인

**포기 기준**: 라우팅 오류 2회 → Next.js 문서 확인 또는 수동 라우팅 설정

---

#### **MT-1.2: Layout 컴포넌트** (필수)
**핵심**: Header + Footer, 모든 페이지에 공통 적용

**파일**: `src/components/shared/Layout.tsx`
```tsx
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-bold">
            Decision Pack Platform
          </a>
          <div className="space-x-4">
            <a href="/app" className="hover:underline">Dashboard</a>
            <a href="/policies" className="hover:underline">Policies</a>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto p-8">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © 2026 Decision Pack Platform v0.1 (Prototype)
      </footer>
    </div>
  );
}
```

**적용**: `src/app/layout.tsx`에서 사용
```tsx
import { Layout } from "@/components/shared/Layout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
```

**검증**:
- [ ] 모든 페이지에 Header + Footer 표시 확인
- [ ] Header 링크 클릭 → 페이지 이동 정상

**포기 기준**: N/A (Layout은 간단)

---

#### **MT-1.3: Constants 정의** (필수)
**핵심**: 매직 넘버/문자열 제거, LOCK 준수

**파일**: `src/contracts/constants.ts`
```typescript
// LOCK-SKU-01: SKU는 2개만
export const SKUS = ["DP_GRANT", "DP_RFP"] as const;
export type SKU = (typeof SKUS)[number];

// LOCK-PROFILE-01: 프로파일 3종
export const PROFILES = ["P1", "P2", "P3"] as const;
export type ProfileId = (typeof PROFILES)[number];

// LOCK-STATE-01: Run 상태머신
export const RUN_STATUSES = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

// Artifact 타입
export const ARTIFACT_TYPES = [
  "PACK_PDF",
  "PACK_DOCX",
  "PACK_PPTX",
  "EVIDENCE_CSV",
  "DISCARD_LOG_CSV",
  "RUN_MANIFEST_JSON",
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

// 환경 변수 (클라이언트)
export const ENV = {
  MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE === "true",
  POLL_INTERVAL: parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000", 10),
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "52428800", 10),
  MAX_TOTAL_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_TOTAL_SIZE || "157286400", 10),
  MAX_URL_COUNT: parseInt(process.env.NEXT_PUBLIC_MAX_URL_COUNT || "30", 10),
} as const;

// Progressive Disclosure 규칙 (LOCK-UX-01)
export const PROFILE_FEATURES = {
  P1: {
    secureMode: false,
    quickPass: false,
    switchingSlots: 0,
    advancedGates: false,
  },
  P2: {
    secureMode: true, // DP-RFP only
    quickPass: false,
    switchingSlots: 3,
    advancedGates: true,
  },
  P3: {
    secureMode: true,
    quickPass: true,
    switchingSlots: 5,
    advancedGates: true,
  },
} as const;
```

**검증**:
- [ ] `npm run typecheck` → 0 errors
- [ ] 다른 파일에서 `import { SKU } from "@/contracts/constants"` 정상 동작

**포기 기준**: N/A

---

#### **MT-1.4: Error Codes 정의** (필수)
**핵심**: LOCK-ERR-01, UI 매핑 포함

**파일**: `src/contracts/errorCodes.ts`
```typescript
export const ERROR_CODES = {
  UPLOAD_UNSUPPORTED: "ERR-UPLOAD-UNSUPPORTED",
  UPLOAD_TOO_LARGE: "ERR-UPLOAD-TOO_LARGE",
  URL_INVALID: "ERR-URL-INVALID",
  URL_LIMIT_EXCEEDED: "ERR-URL-LIMIT_EXCEEDED",
  SECUREMODE_URL_DISABLED: "ERR-SECUREMODE-URL_DISABLED",
  RUN_NOT_FOUND: "ERR-RUN-NOT_FOUND",
  RUN_FAILED: "ERR-RUN-FAILED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  "ERR-UPLOAD-UNSUPPORTED": "지원하지 않는 파일 형식입니다.",
  "ERR-UPLOAD-TOO_LARGE": "파일이 너무 큽니다.",
  "ERR-URL-INVALID": "URL 형식을 확인해 주세요.",
  "ERR-URL-LIMIT_EXCEEDED": "URL은 최대 30개까지 가능합니다.",
  "ERR-SECUREMODE-URL_DISABLED": "Secure Mode에서는 URL 입력이 제한됩니다.",
  "ERR-RUN-NOT_FOUND": "요청을 찾을 수 없습니다.",
  "ERR-RUN-FAILED": "처리 중 오류가 발생했습니다(로그 확인).",
};

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || "알 수 없는 오류가 발생했습니다.";
}
```

**검증**:
- [ ] `npm run typecheck` → 0 errors

**포기 기준**: N/A

---

#### **MT-1.5: Dashboard 기본 UI** (필수)
**핵심**: "새 Run" 버튼 + 최근 Run 리스트 표시 (Mock 데이터)

**파일**: `src/app/app/page.tsx`
```tsx
export default function DashboardPage() {
  // Mock data (임시)
  const recentRuns = [
    { id: "run_001", sku: "DP_GRANT", profile: "P1", status: "SUCCEEDED", created_at: "2026-02-09T10:00:00Z" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <a
          href="/app/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          새 Run 만들기
        </a>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">최근 Run</h2>
        <div className="space-y-2">
          {recentRuns.map((run) => (
            <div key={run.id} className="p-4 border rounded">
              <div className="flex justify-between">
                <div>
                  <span className="font-mono text-sm text-gray-600">{run.id}</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-gray-200 text-xs rounded">{run.sku}</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-xs rounded">{run.profile}</span>
                  </div>
                </div>
                <div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {run.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

**검증**:
- [ ] 브라우저에서 `/app` 접속 → "새 Run 만들기" 버튼 표시
- [ ] 최근 Run 1개 (Mock) 표시 확인

**포기 기준**: N/A

---

#### **MT-1.6: Policy 페이지** (필수)
**핵심**: AI 고지 + 환불 정책 표시 (TC-SMK-06)

**파일**: `src/app/policies/page.tsx`
```tsx
export default function PoliciesPage() {
  return (
    <div className="prose max-w-4xl">
      <h1>약관 및 정책</h1>

      <section className="mt-8">
        <h2>AI 생성 결과물 고지</h2>
        <p>
          본 서비스는 생성형 AI 기술을 활용하여 의사결정 패키지(Decision Pack)를 자동 생성합니다.
          생성된 결과물은 참고 자료로 활용하시기 바라며, 최종 의사결정은 사용자의 책임 하에 이루어져야 합니다.
        </p>
        <ul>
          <li>AI 생성 결과물은 완전성과 정확성을 보장하지 않습니다.</li>
          <li>중요한 의사결정 시 전문가 검토를 권장합니다.</li>
          <li>생성된 근거(Evidence)는 자동 수집된 자료이며, 신뢰성 검증이 필요합니다.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>환불 및 청약철회 정책</h2>
        <p>
          디지털콘텐츠의 특성상, 결과물이 생성된 이후에는 환불 및 청약철회가 제한됩니다.
        </p>
        <ul>
          <li><strong>생성 전 취소</strong>: Run 시작 전까지는 전액 환불 가능</li>
          <li><strong>생성 후 환불</strong>: Run이 RUNNING 상태 이후에는 환불 불가</li>
          <li><strong>시스템 오류</strong>: FAILED 상태로 종료 시 전액 환불</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          결제 전 샘플 결과물(가능 시)을 확인하시고, 동의 후 진행해 주세요.
        </p>
      </section>

      <section className="mt-8">
        <h2>개인정보 처리방침</h2>
        <p>
          본 서비스는 개인정보 최소수집 원칙을 준수합니다.
        </p>
        <ul>
          <li><strong>수집 항목</strong>: 업로드 파일 메타데이터 (파일명, 크기, 타입, 해시)</li>
          <li><strong>수집 목적</strong>: Decision Pack 생성 및 감사 추적</li>
          <li><strong>보관 기간</strong>: 기본 30일 (사용자 선택 가능: 즉시 삭제 ~ 90일)</li>
          <li><strong>원문 저장</strong>: 업로드 파일의 원문 내용은 로깅하지 않습니다 (NFR-PRIV-001)</li>
        </ul>
      </section>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm font-semibold">⚠️ 프로토타입 v0.1 안내</p>
        <p className="text-sm text-gray-700 mt-2">
          본 페이지는 프로토타입용 요약본입니다. 실제 서비스 시 전문 법률 검토 후 완전한 약관이 제공됩니다.
        </p>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] 브라우저에서 `/policies` 접속 → AI 고지 + 환불 정책 표시 (TC-SMK-06)

**포기 기준**: N/A

---

### **Phase 1 완료 체크리스트**
- [ ] TC-SMK-01: Route access (/, /app, /app/new, /policies) — ✅ PASS
- [ ] TC-SMK-06: Policy disclosure (AI 고지 + 환불 정책) — ✅ PASS
- [ ] `npm run lint && npm run typecheck` → 0 errors
- [ ] `npm run build` → 빌드 성공
- [ ] IMPLEMENTATION_SUMMARY.md 업데이트 (Phase 1 완료)

**다음 Phase**: Phase 2 (MS-2 Wizard W0~W4)

---

## 🧙 Phase 2: MS-2 Wizard W0~W4 + Progressive Disclosure

**목표**: Wizard 5단계 구현 + 입력 검증 + Progressive Disclosure
**통과 TC**: TC-SMK-02 (Grant P1 complete), TC-SMK-03 (RFP Secure Mode)

### **협업 프로토콜 (Phase 2 시작 전)**
```markdown
핵심 우선순위:
1. W0 (SKU/Profile/Mode) (필수) — SKU 선택 + Profile 선택
2. W1 (Context) (필수) — Grant/RFP별 필드 분기
3. W2 (Sources) (필수) — 파일 업로드 + URL 입력 (Secure Mode 대응)
4. W3 (Output Config) (필수) — 출력 형식 + 근거 수준
5. W4 (Review/Submit) (필수) — 입력 요약 + AI 고지 체크박스 + 제출

선택 작업:
- Quick-Pass UI (P3) — MS-3에서 해도 됨
- 고급 옵션 상세 UI — 기본만 OK

검증 방법:
- 브라우저에서 W0~W4 단계별 이동 (사용자)
- Progressive Disclosure 규칙 준수 (Claude)
- Lint/Typecheck (Claude)

중요:
- Secure Mode ON 시 URL 입력 비활성화 (LOCK-RFP-SEC-01)
- Profile 변경 시 필드 노출/숨김 (LOCK-UX-01)
```

### **Mini Tasks**

#### **MT-2.1: Wizard 공통 구조** (필수)
**핵심**: Context + Reducer로 Wizard 상태 관리

**파일**: `src/features/wizard/WizardContext.tsx`
```typescript
"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { SKU, ProfileId } from "@/contracts/constants";

export interface WizardState {
  currentStep: number; // 0~4
  sku: SKU | null;
  profileId: ProfileId | null;
  secureMode: boolean;
  runName: string;
  // W1 필드
  context: {
    grant?: {
      projectName: string;
      announcementUrl?: string;
    };
    rfp?: {
      agency: string;
      scope: string;
    };
  };
  // W2 필드
  sources: {
    files: File[];
    urls: string[];
  };
  // W3 필드
  output: {
    formats: string[]; // ["PDF", "DOCX"]
    evidenceLevel: "minimal" | "standard";
  };
}

type WizardAction =
  | { type: "SET_SKU"; payload: SKU }
  | { type: "SET_PROFILE"; payload: ProfileId }
  | { type: "SET_SECURE_MODE"; payload: boolean }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" };
  // ... 기타 액션

const initialState: WizardState = {
  currentStep: 0,
  sku: null,
  profileId: null,
  secureMode: false,
  runName: "",
  context: {},
  sources: { files: [], urls: [] },
  output: { formats: ["PDF"], evidenceLevel: "standard" },
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_SKU":
      return { ...state, sku: action.payload };
    case "SET_PROFILE":
      return { ...state, profileId: action.payload };
    case "SET_SECURE_MODE":
      return { ...state, secureMode: action.payload };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useWizard must be used within WizardProvider");
  return context;
}
```

**검증**:
- [ ] `npm run typecheck` → 0 errors

**포기 기준**: Context 오류 2회 → 간단한 useState로 대체 (DEC 작성)

---

#### **MT-2.2: W0 (SKU/Profile/Mode)** (필수)
**핵심**: SKU 2개만 노출, Profile 선택, Secure Mode 토글 (DP-RFP만)

**파일**: `src/features/wizard/steps/W0.tsx`
```tsx
"use client";

import { useWizard } from "../WizardContext";
import { SKUS, PROFILES, PROFILE_FEATURES } from "@/contracts/constants";

export function WizardStep0() {
  const { state, dispatch } = useWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 0: SKU 및 프로파일 선택</h2>

      {/* SKU 선택 */}
      <div>
        <label className="block font-semibold mb-2">SKU (필수)</label>
        <div className="space-y-2">
          {SKUS.map((sku) => (
            <label key={sku} className="flex items-center space-x-2">
              <input
                type="radio"
                name="sku"
                value={sku}
                checked={state.sku === sku}
                onChange={() => dispatch({ type: "SET_SKU", payload: sku })}
              />
              <span>{sku === "DP_GRANT" ? "DP-Grant (지원사업)" : "DP-RFP (입찰/제안서)"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Profile 선택 */}
      <div>
        <label className="block font-semibold mb-2">Profile (필수)</label>
        <div className="space-y-2">
          {PROFILES.map((profile) => (
            <label key={profile} className="flex items-center space-x-2">
              <input
                type="radio"
                name="profile"
                value={profile}
                checked={state.profileId === profile}
                onChange={() => dispatch({ type: "SET_PROFILE", payload: profile })}
              />
              <span>
                {profile} ({profile === "P1" ? "Fast/Novice" : profile === "P2" ? "Standard" : "Power/Pro"})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Secure Mode (DP-RFP + P2/P3만) */}
      {state.sku === "DP_RFP" && state.profileId && PROFILE_FEATURES[state.profileId].secureMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={state.secureMode}
              onChange={(e) => dispatch({ type: "SET_SECURE_MODE", payload: e.target.checked })}
            />
            <span className="font-semibold">Secure Mode (URL 입력 제한)</span>
          </label>
          <p className="text-sm text-gray-600 mt-2">
            ON 시 URL 자동수집이 비활성화됩니다 (로컬/에어갭 입력만 허용).
          </p>
        </div>
      )}

      {/* AI 고지 동의 (필수) */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <label className="flex items-start space-x-2">
          <input type="checkbox" required className="mt-1" />
          <span className="text-sm">
            <strong>(필수)</strong> AI 기반 생성/분석 결과물임을 확인하였으며,{" "}
            <a href="/policies" target="_blank" className="text-blue-600 underline">
              AI 고지사항
            </a>
            에 동의합니다.
          </span>
        </label>
      </div>

      <button
        onClick={() => dispatch({ type: "NEXT_STEP" })}
        disabled={!state.sku || !state.profileId}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        다음 단계 →
      </button>
    </div>
  );
}
```

**검증**:
- [ ] 브라우저에서 `/app/new` → SKU 2개만 표시 (LOCK-SKU-01)
- [ ] Profile 선택 → Progressive Disclosure 적용 (Secure Mode 노출 여부)
- [ ] AI 고지 체크박스 필수 확인

**포기 기준**: Progressive Disclosure 오류 2회 → 간단한 if 분기로 대체

---

#### **MT-2.3: W1 (Context)** (필수)
**핵심**: Grant/RFP별 필드 분기

**파일**: `src/features/wizard/steps/W1.tsx` (간략히)
```tsx
export function WizardStep1() {
  const { state } = useWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 1: 과업 컨텍스트</h2>

      {state.sku === "DP_GRANT" && (
        <div>
          <label>사업/과제명 (필수)</label>
          <input type="text" className="border p-2 w-full" required />

          <label className="mt-4 block">공고/요강 링크 (선택)</label>
          <input type="url" className="border p-2 w-full" />
        </div>
      )}

      {state.sku === "DP_RFP" && (
        <div>
          <label>발주기관/프로젝트명 (필수)</label>
          <input type="text" className="border p-2 w-full" required />

          <label className="mt-4 block">범위/요구사항 (필수)</label>
          <textarea className="border p-2 w-full" rows={4} required />
        </div>
      )}

      {/* 고급 옵션 (P2/P3) */}
      {/* ... */}

      <div className="flex space-x-4">
        <button onClick={() => dispatch({ type: "PREV_STEP" })}>← 이전</button>
        <button onClick={() => dispatch({ type: "NEXT_STEP" })}>다음 →</button>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] SKU 변경 시 필드 전환 확인

**포기 기준**: N/A

---

#### **MT-2.4: W2 (Sources)** (필수)
**핵심**: 파일 업로드 + URL 입력, Secure Mode ON 시 URL 비활성화

**파일**: `src/features/wizard/steps/W2.tsx` (간략히)
```tsx
export function WizardStep2() {
  const { state } = useWizard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 2: 자료 입력</h2>

      {/* 파일 업로드 */}
      <div>
        <label>파일 업로드 (필수, 1개 이상)</label>
        <input type="file" multiple accept=".pdf,.docx,.hwp,.png,.jpg" />
        <p className="text-sm text-gray-600">허용: PDF, DOCX, HWP, PNG, JPG</p>
      </div>

      {/* URL 입력 (Secure Mode OFF 시만) */}
      {!state.secureMode ? (
        <div>
          <label>URL 입력 (선택, 최대 30개)</label>
          <textarea className="border p-2 w-full" rows={4} />
        </div>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            ⚠️ Secure Mode가 활성화되어 URL 입력이 제한됩니다 (ERR-SECUREMODE-URL_DISABLED).
          </p>
        </div>
      )}

      <div className="flex space-x-4">
        <button onClick={() => dispatch({ type: "PREV_STEP" })}>← 이전</button>
        <button onClick={() => dispatch({ type: "NEXT_STEP" })}>다음 →</button>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] Secure Mode ON → URL 입력 비활성 (TC-SMK-03)

**포기 기준**: N/A

---

#### **MT-2.5: W3 (Output Config)** (필수)
**핵심**: 출력 형식 + 근거 수준

**파일**: `src/features/wizard/steps/W3.tsx` (간략히)
```tsx
export function WizardStep3() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 3: 출력 설정</h2>

      <div>
        <label>출력 형식 (필수)</label>
        <label><input type="checkbox" defaultChecked disabled /> PDF (필수)</label>
        <label><input type="checkbox" /> DOCX (선택)</label>
        <label><input type="checkbox" /> PPTX (선택)</label>
      </div>

      <div>
        <label>근거 수준</label>
        <label><input type="radio" name="evidence" defaultChecked /> 표준 (2개/클레임)</label>
        <label><input type="radio" name="evidence" /> 최소 (1개/클레임)</label>
      </div>

      <div className="flex space-x-4">
        <button onClick={() => dispatch({ type: "PREV_STEP" })}>← 이전</button>
        <button onClick={() => dispatch({ type: "NEXT_STEP" })}>다음 →</button>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] 기본값 확인

**포기 기준**: N/A

---

#### **MT-2.6: W4 (Review/Submit)** (필수)
**핵심**: 입력 요약 + 환불 고지 + 제출

**파일**: `src/features/wizard/steps/W4.tsx` (간략히)
```tsx
export function WizardStep4() {
  const { state } = useWizard();

  const handleSubmit = () => {
    // TODO: POST /api/runs (MS-3에서 구현)
    alert("Run 생성 완료! (Mock)");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 4: 리뷰 및 제출</h2>

      {/* 입력 요약 */}
      <div className="p-4 bg-gray-50 border rounded">
        <h3 className="font-semibold">입력 요약</h3>
        <p>SKU: {state.sku}</p>
        <p>Profile: {state.profileId}</p>
        <p>Secure Mode: {state.secureMode ? "ON" : "OFF"}</p>
      </div>

      {/* 환불 고지 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <label className="flex items-start space-x-2">
          <input type="checkbox" required className="mt-1" />
          <span className="text-sm">
            <strong>(필수)</strong>{" "}
            <a href="/policies" target="_blank" className="text-blue-600 underline">
              환불/청약철회 정책
            </a>
            을 확인하였으며, Run 시작 후에는 환불이 제한됨을 동의합니다.
          </span>
        </label>
      </div>

      <div className="flex space-x-4">
        <button onClick={() => dispatch({ type: "PREV_STEP" })}>← 이전</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
          제출 (Run 시작)
        </button>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] 환불 고지 체크박스 필수 (TC-SMK-06)
- [ ] 제출 클릭 → alert 표시 (Mock)

**포기 기준**: N/A

---

#### **MT-2.7: Wizard 메인 페이지** (필수)
**핵심**: WizardProvider + 단계별 렌더링

**파일**: `src/app/app/new/page.tsx`
```tsx
"use client";

import { WizardProvider, useWizard } from "@/features/wizard/WizardContext";
import { WizardStep0 } from "@/features/wizard/steps/W0";
import { WizardStep1 } from "@/features/wizard/steps/W1";
// ... W2, W3, W4 import

function WizardContent() {
  const { state } = useWizard();

  const steps = [
    <WizardStep0 key="w0" />,
    <WizardStep1 key="w1" />,
    <WizardStep2 key="w2" />,
    <WizardStep3 key="w3" />,
    <WizardStep4 key="w4" />,
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">새 Run 만들기</h1>
      <div className="mb-4 flex space-x-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              i === state.currentStep ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {i}
          </div>
        ))}
      </div>
      {steps[state.currentStep]}
    </div>
  );
}

export default function WizardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
```

**검증**:
- [ ] `/app/new` 접속 → Step 0 표시
- [ ] 단계별 이동 (0→1→2→3→4) 정상 동작

**포기 기준**: N/A

---

### **Phase 2 완료 체크리스트**
- [ ] TC-SMK-02: DP-Grant P1 Wizard 완료 → Run 생성 (Mock alert) — ✅ PASS
- [ ] TC-SMK-03: DP-RFP Secure Mode → URL 비활성 확인 — ✅ PASS
- [ ] `npm run lint && npm run typecheck` → 0 errors
- [ ] `npm run build` → 빌드 성공
- [ ] IMPLEMENTATION_SUMMARY.md 업데이트 (Phase 2 완료)

**다음 Phase**: Phase 3 (MS-3 Run Flow + Mock API)

---

## ⚙️ Phase 3: MS-3 Run Flow + Mock API + State Machine

**목표**: Mock API + 상태머신 + LocalStorage + 폴링 + 결과 다운로드
**통과 TC**: TC-SMK-04 (SUCCEEDED download), TC-SMK-05 (FAILED → Discard CTA)

### **협업 프로토콜 (Phase 3 시작 전)**
```markdown
핵심 우선순위:
1. Mock API 구현 (필수) — POST /api/runs, GET /api/runs/:runId
2. LocalStorage 유틸 (필수) — Run 저장/조회
3. 상태머신 타이머 (필수) — QUEUED→RUNNING→SUCCEEDED/FAILED
4. Run 상세 페이지 (필수) — 폴링 + 결과 표시
5. Discard Knowledge CTA (필수) — FAILED 시 카드 생성 버튼

선택 작업:
- Quick-Pass 템플릿 재사용 (P3) — MS-4에서 해도 됨
- Artifacts 다운로드 실제 파일 생성 — 샘플 blob으로 OK

검증 방법:
- 브라우저에서 Run 생성 → 상태 전환 → 다운로드 (사용자)
- LocalStorage 데이터 확인 (DevTools)
- Lint/Typecheck (Claude)

중요:
- LOCK-STATE-01: 상태머신만 상태 변경 가능
- LOCK-LOG-01: Manifest JSON 필수 생성
```

### **Mini Tasks**

#### **MT-3.1: LocalStorage 유틸** (필수)
**핵심**: Run 저장/조회/리스트 관리

**파일**: `src/lib/storage.ts`
```typescript
import { RunSummary, RunDetail } from "@/contracts/run";

const KEYS = {
  RUNS_LIST: "dpp_runs",
  RUN_PREFIX: "dpp_run_",
  DISCARD_KNOWLEDGE: "dpp_discard_knowledge",
} as const;

export const storage = {
  // Run 리스트 조회
  getRunsList(): RunSummary[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(KEYS.RUNS_LIST);
    if (!stored) return [];
    const { runs } = JSON.parse(stored);
    return runs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Run 리스트 업데이트
  updateRunsList(run: RunSummary) {
    if (typeof window === "undefined") return;
    const runs = this.getRunsList();
    const index = runs.findIndex((r) => r.run_id === run.run_id);
    if (index >= 0) {
      runs[index] = run;
    } else {
      runs.push(run);
    }
    // LRU: 최근 50개만 유지
    const limited = runs.slice(0, 50);
    localStorage.setItem(KEYS.RUNS_LIST, JSON.stringify({ runs: limited, lastUpdated: new Date().toISOString() }));
  },

  // Run 상세 저장
  saveRun(run: RunDetail) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${KEYS.RUN_PREFIX}${run.run_id}`, JSON.stringify(run));
    this.updateRunsList({
      run_id: run.run_id,
      sku: run.sku,
      profile_id: run.profile_id,
      status: run.status,
      created_at: run.created_at,
      run_name: run.run_name,
    });
  },

  // Run 상세 조회
  getRun(runId: string): RunDetail | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`${KEYS.RUN_PREFIX}${runId}`);
    if (!stored) return null;
    return JSON.parse(stored);
  },
};
```

**검증**:
- [ ] `npm run typecheck` → 0 errors

**포기 기준**: N/A

---

#### **MT-3.2: Mock API Provider** (필수)
**핵심**: POST /api/runs, 상태 전환 타이머

**파일**: `src/lib/mockApi.ts`
```typescript
import { nanoid } from "nanoid";
import { RunDetail, RunSummary } from "@/contracts/run";
import { storage } from "./storage";

// In-Memory 상태 맵 (폴링 중 임시 상태)
const runStatusMap = new Map<string, RunStatus>();

export const mockApi = {
  // POST /api/runs
  async createRun(inputs: WizardState): Promise<RunSummary> {
    const runId = `run_${nanoid(12)}`;

    const run: RunDetail = {
      run_id: runId,
      created_at: new Date().toISOString(),
      sku: inputs.sku!,
      profile_id: inputs.profileId!,
      run_name: inputs.runName || `Run ${runId}`,
      status: "QUEUED",
      inputs,
      manifest: generateManifest(inputs, runId),
      artifacts: [],
    };

    // LocalStorage 저장
    storage.saveRun(run);

    // In-Memory 상태 초기화
    runStatusMap.set(runId, "QUEUED");

    // 상태 전환 타이머 시작
    scheduleStatusTransition(runId);

    return {
      run_id: run.run_id,
      sku: run.sku,
      profile_id: run.profile_id,
      status: run.status,
      created_at: run.created_at,
      run_name: run.run_name,
    };
  },

  // GET /api/runs/:runId
  async getRun(runId: string): Promise<RunDetail | null> {
    // In-Memory 확인
    const memoryStatus = runStatusMap.get(runId);

    // LocalStorage에서 복원
    const run = storage.getRun(runId);
    if (!run) return null;

    // In-Memory 상태가 더 최신이면 병합
    if (memoryStatus && memoryStatus !== run.status) {
      run.status = memoryStatus;
      storage.saveRun(run); // 동기화
    }

    return run;
  },
};

// 상태 전환 타이머 (LOCK-STATE-01)
function scheduleStatusTransition(runId: string) {
  // QUEUED → RUNNING (2초 후)
  setTimeout(() => {
    updateRunStatus(runId, "RUNNING");

    // RUNNING → SUCCEEDED/FAILED (5~10초 랜덤)
    const duration = 5000 + Math.random() * 5000;
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% 성공률
      updateRunStatus(runId, success ? "SUCCEEDED" : "FAILED");

      if (success) {
        generateArtifacts(runId);
      }
    }, duration);
  }, 2000);
}

function updateRunStatus(runId: string, status: RunStatus) {
  runStatusMap.set(runId, status);

  const run = storage.getRun(runId);
  if (run) {
    run.status = status;
    storage.saveRun(run);
  }
}

function generateArtifacts(runId: string) {
  const run = storage.getRun(runId);
  if (!run) return;

  run.artifacts = [
    { type: "PACK_PDF", filename: `Pack_${runId}.pdf`, sha256: "dummy_hash_pdf" },
    { type: "RUN_MANIFEST_JSON", filename: `Run_Manifest_${runId}.json`, sha256: "dummy_hash_json" },
  ];
  storage.saveRun(run);
}

function generateManifest(inputs: WizardState, runId: string): RunManifest {
  return {
    run_id: runId,
    created_at: new Date().toISOString(),
    sku: inputs.sku!,
    profile_id: inputs.profileId!,
    ruleset_version: "v0.2.1",
    secure_mode: { enabled: inputs.secureMode, mode: inputs.secureMode ? "airgap" : "cloud" },
    inputs: {
      files: [], // 파일 메타만
      urls: inputs.sources.urls.map((url) => ({ canonical: url })),
    },
    gates: { mode: "standard", thresholds: {} },
    outputs: { artifacts: [] },
    audit: { decisions: [], warnings: [] },
  };
}
```

**검증**:
- [ ] `npm run typecheck` → 0 errors

**포기 기준**: 타이머 오류 2회 → 상태 즉시 전환으로 단순화 (DEC 작성)

---

#### **MT-3.3: W4 제출 → Run 생성** (필수)
**핵심**: W4 제출 시 mockApi.createRun 호출

**파일**: `src/features/wizard/steps/W4.tsx` (수정)
```tsx
import { mockApi } from "@/lib/mockApi";
import { useRouter } from "next/navigation";

export function WizardStep4() {
  const { state } = useWizard();
  const router = useRouter();

  const handleSubmit = async () => {
    const run = await mockApi.createRun(state);
    alert(`Run 생성 완료! ID: ${run.run_id}`);
    router.push(`/app/run/${run.run_id}`);
  };

  // ...
}
```

**검증**:
- [ ] W4 제출 → Run 생성 → `/app/run/:runId` 이동

**포기 기준**: N/A

---

#### **MT-3.4: Run 상세 페이지 (폴링)** (필수)
**핵심**: 폴링으로 상태 추적, SUCCEEDED 시 다운로드 버튼

**파일**: `src/app/run/[runId]/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { mockApi } from "@/lib/mockApi";
import { RunDetail } from "@/contracts/run";

export default function RunDetailPage() {
  const { runId } = useParams();
  const [run, setRun] = useState<RunDetail | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await mockApi.getRun(runId as string);
      if (data) {
        setRun(data);
        if (data.status === "SUCCEEDED" || data.status === "FAILED") {
          clearInterval(interval); // 폴링 중단
        }
      }
    }, 5000); // 5초 폴링

    return () => clearInterval(interval);
  }, [runId]);

  if (!run) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Run {run.run_id}</h1>
      <div className="mt-4 p-4 border rounded">
        <p>Status: <span className="font-bold">{run.status}</span></p>
        <p>SKU: {run.sku}</p>
        <p>Profile: {run.profile_id}</p>
      </div>

      {run.status === "SUCCEEDED" && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">결과물 다운로드</h2>
          {run.artifacts.map((artifact) => (
            <button key={artifact.type} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              {artifact.filename} 다운로드
            </button>
          ))}
        </div>
      )}

      {run.status === "FAILED" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p>처리 중 오류가 발생했습니다.</p>
          <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded">
            Discard Knowledge 카드 생성
          </button>
        </div>
      )}
    </div>
  );
}
```

**검증**:
- [ ] Run 생성 → 2초 후 RUNNING → 5~10초 후 SUCCEEDED/FAILED (TC-SMK-04)
- [ ] SUCCEEDED → 다운로드 버튼 활성
- [ ] FAILED → Discard CTA 표시 (TC-SMK-05)

**포기 기준**: 폴링 오류 2회 → 새로고침으로 상태 확인 (DEC 작성)

---

### **Phase 3 완료 체크리스트**
- [ ] TC-SMK-04: Run 상태 폴링 (QUEUED→RUNNING→SUCCEEDED) — ✅ PASS
- [ ] TC-SMK-05: FAILED Run → Discard CTA 표시 — ✅ PASS
- [ ] `npm run lint && npm run typecheck` → 0 errors
- [ ] `npm run build` → 빌드 성공
- [ ] IMPLEMENTATION_SUMMARY.md 업데이트 (Phase 3 완료)

**다음 Phase**: Phase 4 (MS-4 Log/Manifest Viewer)

---

## 📊 Phase 4: MS-4 Log/Manifest Viewer + Telemetry

**목표**: Manifest JSON Viewer + 다운로드 + Telemetry 이벤트
**통과 TC**: TC-SMK-07 (Manifest view/download)

### **Mini Tasks**

#### **MT-4.1: Log 페이지 (Manifest Viewer)** (필수)
**핵심**: JSON 접기/복사/다운로드

**파일**: `src/app/run/[runId]/log/page.tsx`
```tsx
"use client";

import { useParams } from "next/navigation";
import { mockApi } from "@/lib/mockApi";
import { useState, useEffect } from "react";

export default function LogPage() {
  const { runId } = useParams();
  const [run, setRun] = useState(null);

  useEffect(() => {
    mockApi.getRun(runId as string).then(setRun);
  }, [runId]);

  if (!run) return <div>Loading...</div>;

  const handleDownload = () => {
    const json = JSON.stringify(run.manifest, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Run_Manifest_${runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Run {runId} — Log</h1>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Run Manifest</h2>
        <button onClick={handleDownload} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Manifest 다운로드
        </button>
        <pre className="mt-4 p-4 bg-gray-50 border rounded overflow-auto max-h-96">
          {JSON.stringify(run.manifest, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] `/app/run/:runId/log` 접속 → Manifest JSON 표시 (TC-SMK-07)
- [ ] 다운로드 버튼 → `Run_Manifest_{runId}.json` 파일 다운로드

**포기 기준**: N/A

---

#### **MT-4.2: Telemetry 이벤트** (선택)
**핵심**: 콘솔 + in-memory queue

**파일**: `src/lib/telemetry.ts`
```typescript
type TelemetryEvent =
  | { type: "ui.wizard.step_viewed"; step_id: string; profile_id: string }
  | { type: "run.result.downloaded"; artifact_type: string };

export function logEvent(event: TelemetryEvent) {
  console.log("[Telemetry]", event);
  // 향후 BE 전송
}
```

**검증**:
- [ ] 콘솔에 이벤트 출력 확인

**포기 기준**: 선택 작업 (생략 가능)

---

### **Phase 4 완료 체크리스트**
- [ ] TC-SMK-07: Manifest view/download — ✅ PASS
- [ ] `npm run lint && npm run typecheck` → 0 errors
- [ ] IMPLEMENTATION_SUMMARY.md 업데이트 (Phase 4 완료)

**다음 Phase**: Phase 5 (MS-5 Polish + Final DoD)

---

## ✨ Phase 5: MS-5 Polish + Final DoD

**목표**: A11y + 보안 검증 + 최종 DoD 통과
**통과 TC**: TC-SMK-08 (keyboard-only), ALL Smoke Tests

### **Mini Tasks**

#### **MT-5.1: 키보드 탐색 점검** (필수)
**핵심**: Wizard를 Tab/Enter/Space만으로 완료 가능

**작업**:
- 모든 `<button>`, `<input>`, `<a>`에 포커스 순서 확인
- 모달 사용 시 포커스 트랩 추가

**검증**:
- [ ] 키보드만으로 W0~W4 완료 → Run 생성 (TC-SMK-08)

**포기 기준**: 복잡한 포커스 관리 오류 2회 → 기본 탭 순서로 OK (DEC 작성)

---

#### **MT-5.2: 보안 검증** (필수)
**핵심**: eval/innerHTML 0건

**작업**:
```bash
grep -r "eval(" src/          # → 0 results
grep -r "innerHTML" src/      # → 0 results
grep -r "dangerouslySetInnerHTML" src/  # → 0 results
```

**검증**:
- [ ] 모든 검색 결과 0건 (LOCK-SEC-UI-01)

**포기 기준**: N/A (위반 시 즉시 수정)

---

#### **MT-5.3: 최종 DoD 점검** (필수)
**핵심**: ALL Smoke Tests PASS

**작업**:
- TC-SMK-01~09 전체 재검증
- `npm run lint && npm run typecheck && npm run build` → 0 errors

**검증**:
- [ ] ALL Smoke Tests PASS
- [ ] Prototype v0.1 Complete Criteria 충족

**포기 기준**: N/A

---

### **Phase 5 완료 체크리스트**
- [ ] TC-SMK-08: Keyboard-only Wizard — ✅ PASS
- [ ] Security gates: eval/innerHTML = 0 results — ✅ PASS
- [ ] ALL Smoke Tests (TC-SMK-01~09) — ✅ PASS
- [ ] `npm run lint && npm run typecheck && npm run build` → 0 errors
- [ ] IMPLEMENTATION_SUMMARY.md 최종 업데이트

**프로토타입 v0.1 완료! 🎉**

---

## 📝 협업 프로토콜 v2.0 적용 요약

이 로드맵은 FEEDBACK_TO_USER_v1.txt의 개선 사항을 반영했습니다:

1. **초기 컨텍스트 강화**: 각 Mini Task마다 필수/선택 구분, 핵심 포인트, 참고 파일 명시
2. **빠른 포기 결정**: 각 Task에 "포기 기준" 명시 (보통 2회 실패)
3. **검증 책임 명시**: Phase마다 "검증 방법" 사전 합의 (브라우저=사용자, 코드=Claude)
4. **우선순위 표시**: 각 Task에 (필수)/(선택) 태그
5. **에러 정보 상세**: 작업 중 에러 발생 시 콘솔 메시지 + 예상 원인 제공 요청

---

**End of Roadmap**
