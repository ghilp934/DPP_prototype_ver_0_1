# Decision Pack Platform — Frontend Prototype Spec (T1) v0.1  
Date: 2026-02-09 (KST)  
Status: Draft (Prototype v0.1)  
Audience: Claude Code(구현) / FE / QA / Tech Head  
Source of Truth: Decision_Pack_Platform_FE_Spec_T1_v0_2_1.md (Spec Lock v0.2.1) — 본 문서는 “프론트엔드 프로토타입 v0.1” 구현을 위해 v0.2.1을 구현 친화 형태로 재구성한 문서입니다.

---

## [0] Document Control & Writing Rules (Hard)

### Deliverable
- 단일 마크다운 기술명세서: 본 문서(Claude Code 입력용)

### Input-First Policy
- 기능/정책/유저여정/요구사항은 **v0.2.1 원문을 우선**으로 한다.
- 본 v0.1은 “프로토타입”이므로 **결제/백엔드 연동은 Stub/MOCK** 허용(단, UX/상태/에러코드/로그는 고정).

### Requirements Writing Rules (Must)
- FR/NFR 모두: `ID` + “The system shall …” + `Acceptance Criteria(AC) 최소 2개`
- 애매함(TBD) 방치 금지 → `DEC`(결정로그) 또는 `OPEN`(오픈이슈)로 격리
- Limits & Quotas / Error Code는 **결정론적으로 잠금**
- Traceability 필수: `UJ → Screen → FR/NFR → TC → DEC/OPEN` 연결

---

## [0A] Pre-code Questions (Gate: 비어 있으면 구현 착수 금지)

- PCQ-1(DoD): v0.1 완료 정의는 무엇인가?  
  - 답: **Wizard(W0~W4) 완료 → Run 생성 → 상태(QUEUED/RUNNING/SUCCEEDED/FAILED) 전환 → 결과 다운로드 버튼/Manifest 보기/로그 화면 확인**까지 Smoke Test 5종 통과.
- PCQ-2(Scope): 반드시 포함/반드시 제외는?  
  - 포함: SKU 2종(DP-Grant/DP-RFP), Wizard, Quick‑Pass(숨김), Secure Mode(입력/제약 UI), Run Manifest 표시/다운로드, Discard Knowledge 카드(반자동)  
  - 제외: 실제 결제 PG/정산/세금계산서 “완전 구현”, BE의 실제 생성 로직(대신 Mock), 외부 자동 수집(대신 UI/로그/제약만)
- PCQ-3(Constraints): 금지/LOCK/게이트 위반 시?  
  - 답: LOCK 위반은 **DEC 작성 전 코드 변경 금지**, 보안 금지(eval/innerHTML 등) 위반은 즉시 Fail.
- PCQ-4(Files): 어떤 경로만 수정? (권장)  
  - `apps/web/*` 또는 단일 FE repo 기준 `src/*`, `public/*`, `.env.example`, `README.md`, `docs/*`  
  - 범위 밖 수정 금지(추가 시 DEC 필요)
- PCQ-5(Verify): 검증 절차?  
  - `lint` / `typecheck` / `build` / `smoke`(TC-SMK-*)를 “작업 전·후” 수행하고 결과를 요약 로그로 남김.

---

## [0B] LOCK Register (Non‑Negotiables)

| LOCK ID | Lock Item | Value (Locked) | Why | Trade-off |
|---|---|---|---|---|
| LOCK-SKU-01 | SKU | DP‑Grant, DP‑RFP 2개만 | 집중/혼선 제거 | 확장 지연 |
| LOCK-UX-01 | Core UX | Wizard + Progressive Disclosure | 초보/전문가 동시 수용 | 설계 복잡 |
| LOCK-UX-02 | Quick‑Pass | “최근 Run 템플릿 재사용” + “필수만 제출”(기본 숨김) | 반복 제출 시간 절감 | 초보 혼란 |
| LOCK-RFP-SEC-01 | Secure Mode | DP‑RFP에서 URL 입력 비활성 + 안내 + Manifest 기록 | 고보안 대응 | 자동 수집 제한 |
| LOCK-LOG-01 | Run Manifest | 모든 Run에 Manifest JSON 생성/표시/다운로드 | 감사/재현/분쟁 방어 | 보관정책 필요 |
| LOCK-PRIV-01 | Privacy UX | 최소수집/짧은 보관/즉시 삭제 옵션을 UX로 강제 | PII 리스크↓ | UX 마찰↑ |
| LOCK-SEC-UI-01 | FE 보안 금지 | `eval`, `innerHTML`, `dangerouslySetInnerHTML` 사용 금지 | XSS/주입 방어 | 표현력 제한 |
| LOCK-STATE-01 | State Machine | Run 상태는 단일 상태머신으로만 전환 | 드리프트 방지 | 구현 비용↑ |
| LOCK-ERR-01 | Error Codes | ERR-* 코드 테이블 고정 | 대응/QA 용이 | 유연성↓ |
| LOCK-TOOLS-01 | Toolchain | Node 24 LTS + Next.js 16.x + React 19.x + TS | 재현성/보안 패치 | 업그레이드 부담 |

---

## [0C] Milestones (Increment Plan)

- MS-1 Skeleton: routes/layout/constants + 정책(/policies) + 대시보드(/app)
  - 통과 TC: TC-SMK-01(라우트 접근), TC-SMK-06(정책 고지 표시)
- MS-2 Wizard W0~W4 + Progressive Disclosure + 입력 검증/에러코드 매핑
  - 통과 TC: TC-SMK-02(Grant P1 완료), TC-SMK-03(RFP Secure Mode)
- MS-3 Run Flow + Mock API(상태 전환) + 처리중/결과
  - 통과 TC: TC-SMK-04(SUCCEEDED 다운로드), TC-SMK-05(FAILED → Discard CTA)
- MS-4 Log/Manifest Viewer + Telemetry 이벤트(콘솔/로컬 큐)
  - 통과 TC: TC-SMK-07(Manifest 보기/다운로드)
- MS-5 Polish: A11y/키보드/ARIA + 기본 성능 + Lint/Typecheck/Build 잠금
  - 통과 TC: TC-SMK-08(키보드만 Wizard 완료)

---

## [0F] Toolchain Baseline (Locked)

- Node.js: 24.x LTS (LOCK-TOOLS-01)
- Framework: Next.js 16.x (App Router) / React 19.x
- Language: TypeScript 필수
- Styling/UI: Tailwind + shadcn/ui(또는 동급) — 단, “설치/의존성 추가”는 DEC로 기록
- State: 경량(React state + reducer) + Run 상태머신(단일 소스)
- Mock: in-app mock provider(외부 의존 최소)

---

## [1] Overview

Decision Pack Platform은 “근거가 붙은 의사결정 패키지(Decision Pack)”를 생성/검증 가능한 형태로 제공한다.  
Frontend Prototype v0.1의 목표는 **생성 자체보다 “근거/감사/재현(Manifest)”이 제품 기능으로 노출되는 UX**를 구현하여, 후속 BE/결제/운영 확장을 위한 “확정된 화면/상태/에러/로그”를 확보하는 것이다.

---

## [2] Scope

### In Scope
- SKU 2종: DP‑Grant, DP‑RFP
- 화면 5종: 입력(Wizard) / 결제(Stub) / 처리중 / 결과 / 로그(+정책)
- Quick‑Pass(숨김 기본값) + Progressive Disclosure
- Secure Mode(DP‑RFP): URL 입력 비활성 + 안내 + Manifest 반영
- Run Manifest(JSON) 보기/다운로드(필수)
- Discard Knowledge 카드 생성/편집(반자동 기본)
- Evidence Index(노출/재사용) UI(초기: 정적 Mock)

### Out of Scope
- 실제 결제 PG/정산/세금계산서 완전 구현
- 실제 생성 파이프라인/리서치 엔진(대신 Mock)
- 관리자(Backoffice) 전면 구현

### Constraints
- AI 고지/표시 및 디지털콘텐츠 환불/청약철회 고지를 결제 전 UX에 포함(LOCK)
- 개인정보 최소수집/보관/삭제 옵션을 UX로 강제(LOCK)
- 보안(업로드/URL/SSRF) 요구사항은 DoD 포함(LOCK)

---

## [3] Stakeholders & Roles

- PO: 요구사항/정책 승인, LOCK/DEC 관리
- FE(Claude Code): 화면/상태/검증/로그 구현
- BE(미정): 추후 API 제공(현 v0.1은 Mock)
- QA: Smoke/회귀 체크
- Security/Legal: 업로드/URL/고지/환불 UX 검수

---

## [4] Glossary

- DP: Decision Pack
- SKU: 상품 단위(여기서는 DP‑Grant, DP‑RFP)
- Run: 한 번의 생성/처리 단위(입력+옵션+결과+Manifest)
- Manifest: 감사/재현을 위한 Run 요약 JSON
- Discard Log: URL 스크리닝에서 제외된 항목과 사유 기록
- Discard Knowledge: 실패/배제 지식을 카드로 축적(재발 방지)

---

## [5] IA / Routes (Locked)

- `/` : Landing
- `/app` : Dashboard (최근 Run, 새로 만들기)
- `/app/new` : Wizard (W0~W4)
- `/app/pay/:runId` : 결제(Stub) (또는 W4 결제 모달)
- `/app/run/:runId` : 처리중/결과(상태 기반)
- `/app/run/:runId/log` : 로그/감사(Manifest 포함)
- `/policies` : 약관/개인정보/AI 고지/환불(요약)

---

## [6] User Journeys (E2E)

### UJ-001: DP‑Grant 기본 제출 (P1 Fast)
- Trigger: /app → “새 Run”
- Steps: W0(SKU=Grant,P1) → W1(컨텍스트) → W2(파일 업로드) → W3(출력 설정) → W4(리뷰/고지/결제) → RUNNING → SUCCEEDED → 결과 다운로드
- Exceptions: 업로드 제한 위반(413/422), Run 실패(FAILED)
- Done: Pack.pdf + Run_Manifest.json 다운로드 가능
- Trace: Screen=[S-W0..S-W4,S-RUN,S-RESULT,S-LOG], FR=[FR-001..], TC=[TC-SMK-02,04,07]

### UJ-002: DP‑RFP Secure Mode (P2 Standard)
- Trigger: W0에서 SKU=RFP 선택
- Steps: Secure Mode ON → W2에서 URL 입력 비활성 확인 → 제출 → Manifest에 secure_mode.enabled=true 확인
- Done: URL 제한 안내 + Manifest 확인
- Trace: Screen=[S-W0,S-W2,S-LOG], FR=[FR-005,FR-012,FR-023], TC=[TC-SMK-03,07]

### UJ-003: Quick‑Pass (P3 Pro, 숨김)
- Trigger: /app에서 “Quick‑Pass” 토글 ON
- Steps: 직전 Run 선택 → W1~W3 자동 채움 → 필수만 입력 → 제출
- Done: 2회차 제출 시간 단축(측정 이벤트 기록)
- Trace: FR=[FR-004], TC=[TC-SMK-09]

### UJ-004: FAILED Run → Discard Knowledge 카드 생성(반자동)
- Trigger: Run 상태 FAILED
- Steps: 결과 화면에서 “카드 생성” CTA → 원인/증상/조치 입력 → 저장
- Done: 카드 리스트에서 확인 가능
- Trace: FR=[FR-024], TC=[TC-SMK-05]

---

## [7] System Design Overview (FE)

### FE Structure
- App Router 기준: 페이지 라우팅 + 공통 Layout + 공통 컴포넌트
- 공통 폴더(권장):
  - `src/app/*` routes
  - `src/components/*` UI
  - `src/features/run/*` run 상태/훅/컴포넌트
  - `src/features/wizard/*` 단계별 폼/검증/접힘 규칙
  - `src/lib/*` canonicalizeUrl, validators, telemetry, mockApi
  - `src/contracts/*` 타입(Manifest/Run/Artifacts/ErrorCodes) 단일 소스

### State Management (Single Source of Truth)
- Run 상태머신: `RunStatus = QUEUED | RUNNING | SUCCEEDED | FAILED`
- Wizard Draft: 단계별 slice + “Profile Folding” 규칙으로 필드 활성/비활성 결정

### Data Flow
- UI → `apiClient` → (MOCK 모드면) `mockApi` → runStore 업데이트
- 결과 다운로드는 signed URL 대신 prototype용 “blob 생성/샘플 파일” 허용

### Security Baselines
- 입력 원문(문서 내용) 로깅 금지(메타/해시 중심)
- 외부 링크는 `target=_blank` 시 `rel="noopener noreferrer"` 고정
- FE에서의 파일은 **업로드 전 검증(확장자/용량)**, 서버 검증은 추후 BE로 전제

---

## [8] Screens & Components

### S-APP-01 Dashboard (/app)
- 최근 Run 리스트: run_id, sku, profile, status, created_at
- Actions: 새 Run, Quick‑Pass(숨김 토글), Run 상세/로그로 이동

### S-W0 Wizard Step 0 (SKU/Profile/Mode)
필수
- SKU, Profile(P1/P2/P3), Run Name(자동제안), 목적(짧은 설명), 언어(KR 기본)
- AI 고지/표시 동의 체크(필수)
고급(접힘)
- DP‑RFP Secure Mode 토글 + 안내
- Quick‑Pass(접힘, P3)

### S-W1 Context
- Grant: 사업/과제명, 공고 링크(선택), 제출 형식/분량, 평가 기준(선택)
- RFP: 발주기관/프로젝트명, 범위/요구사항, 제출물, 평가 기준(선택)
고급
- Gate 프로파일(엄격/표준/완화)
- 스위칭 가정 슬롯(프로파일별 상한)

### S-W2 Sources
- 파일 업로드(필수 1개 이상 가능): PDF/DOCX/HWP/PNG/JPG
- URL 입력(선택, 최대 30) — Secure Mode ON 시 비활성
고급
- URL 스크리닝 Gate 옵션
- OCR 프리셋(표시만, 실제 OCR은 v0.1에서 미구현 가능)

### S-W3 Output Config
필수
- 출력 형식: PDF(필수) + DOCX/PPTX(옵션)
- 근거 수준: 최소(1개/클레임) vs 표준(2개/클레임)
고급
- Evidence Map ON/OFF
- Discard Knowledge 모드(자동/반자동/끄기 — 기본 반자동)
- Manifest 다운로드는 ON 고정

### S-W4 Review/Pay/Submit
- 입력 요약, 비용(크레딧/팩) 표시(Stub)
- 환불/청약철회 제한 고지 + 샘플 제공(가능 시)
- Submit → /app/run/:runId 이동

### S-RUN Processing (/app/run/:runId)
- 상태 표시 + 폴링(3~10초) + 네트워크 오류 UI
- 취소(프로토타입: “취소 요청 전송” UI만 제공 가능)

### S-RESULT Result (/app/run/:runId)
- artifacts 목록 + 다운로드 버튼
- Evidence 리스트(초기: Mock)
- FAILED면: 로그 보기 + Discard Knowledge 카드 CTA

### S-LOG Log (/app/run/:runId/log)
- Manifest JSON viewer(접기/복사/다운로드)
- 이벤트 타임라인(telemetry 최소 표시)
- Discard Log(통과/제외 사유) 테이블 + 다운로드

---

## [9] Data Contracts (Prototype)

### 9.1 Core Types

```ts
type SKU = "DP_GRANT" | "DP_RFP";
type ProfileId = "P1" | "P2" | "P3";
type RunStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

type RunSummary = {
  run_id: string;
  created_at: string;
  sku: SKU;
  profile_id: ProfileId;
  status: RunStatus;
  run_name: string;
};

type ArtifactType = "PACK_PDF" | "PACK_DOCX" | "PACK_PPTX" | "EVIDENCE_CSV" | "DISCARD_LOG_CSV" | "RUN_MANIFEST_JSON";

type Artifact = {
  type: ArtifactType;
  filename: string;
  sha256?: string;        // v0.1: optional
  download_url?: string;  // v0.1: stub
};

type RunManifest = {
  run_id: string;
  created_at: string;
  sku: SKU;
  profile_id: ProfileId;
  ruleset_version: string; // "v0.2.1"
  secure_mode: { enabled: boolean; mode: "airgap" | "local" | "cloud" };
  inputs: {
    files: { name: string; size: number; type: string; sha256?: string }[];
    urls: { canonical: string }[];
  };
  gates: { mode: "strict" | "standard" | "relaxed"; thresholds?: Record<string, number> };
  outputs: { artifacts: Artifact[] };
  audit: { decisions: string[]; warnings: string[] };
};
```

### 9.2 Error Codes (Front) — Locked
- ERR-UPLOAD-UNSUPPORTED, ERR-UPLOAD-TOO_LARGE, ERR-URL-INVALID, ERR-URL-LIMIT_EXCEEDED,
  ERR-SECUREMODE-URL_DISABLED, ERR-RUN-NOT_FOUND, ERR-RUN-FAILED

### 9.3 Mock API (v0.1)
- `POST /api/runs` → Run 생성(QUEUED 반환)
- `GET /api/runs/:runId` → status/summary
- `GET /api/runs/:runId/artifacts` → artifacts 목록
- `GET /api/runs/:runId/manifest` → manifest
- `POST /api/runs/:runId/discard-knowledge` → 카드 저장

v0.1 원칙:
- BE가 없으면 Next API Routes(또는 local mock provider)로 구현 가능
- 상태 전환은 타이머 기반(Mock): QUEUED → RUNNING → SUCCEEDED/FAILED (랜덤 또는 토글)

---

## [10] Functional Requirements (FR)

> 형식: FR-### / The system shall … / AC(최소 2개)

### Wizard & UX
- **FR-001** The system shall allow selecting only two SKUs: DP‑Grant and DP‑RFP.  
  - AC1: SKU UI는 2개만 노출되어야 한다.  
  - AC2: 다른 SKU 값 주입(쿼리/로컬스토리지) 시 기본값으로 리셋되거나 오류 처리되어야 한다.
- **FR-002** The system shall require selecting a Profile (P1/P2/P3) and record it in Run Manifest.  
  - AC1: 제출 후 Manifest에 `profile_id`가 존재해야 한다.  
  - AC2: 프로파일 미선택 상태에서는 “다음” 진행이 불가능해야 한다.
- **FR-003** The system shall enforce “Advanced Folding Rules” by profile and wizard step.  
  - AC1: P1에서는 P3 전용 옵션이 노출되지 않거나 disabled 되어야 한다.  
  - AC2: 프로파일 변경 시, 비활성 필드 값은 저장되더라도 “제출 payload”에는 포함되지 않아야 한다.
- **FR-004** The system shall provide Quick‑Pass (template reuse + minimal submit) as hidden-by-default.  
  - AC1: 기본값 OFF이며, ON 시에만 /app에서 Quick‑Pass 진입이 가능해야 한다.  
  - AC2: Quick‑Pass 사용 시 이벤트 `ui.quickpass.used`가 기록되어야 한다.
- **FR-005** The system shall support Secure Mode for DP‑RFP and disable URL input when enabled.  
  - AC1: Secure Mode ON 상태에서 URL 입력 UI는 비활성화되어야 한다.  
  - AC2: 해당 상태가 Manifest의 `secure_mode.enabled=true`로 기록되어야 한다.

### Upload & URL
- **FR-010** The system shall validate allowed file types and reject disallowed uploads with an error code.  
  - AC1: 허용 타입 외 업로드 시 ERR-UPLOAD-UNSUPPORTED를 표시해야 한다.  
  - AC2: ZIP 업로드는 항상 차단되어야 한다.
- **FR-011** The system shall enforce file size limits and show ERR-UPLOAD-TOO_LARGE when exceeded.  
  - AC1: 단일 파일 및 총합 상한(DEC로 잠금)을 초과하면 제출 불가.  
  - AC2: 에러 안내와 함께 사용자 재시도 경로(삭제/교체)를 제공해야 한다.
- **FR-012** The system shall canonicalize and deduplicate input URLs.  
  - AC1: utm 계열 파라미터 차이만 있는 URL은 1개로 병합되어야 한다.  
  - AC2: 병합 결과가 UI에 “중복 제거됨”으로 표시되어야 한다.
- **FR-013** The system shall enforce the URL count limit and show ERR-URL-LIMIT_EXCEEDED on violation.  
  - AC1: N(기본 30) 초과 입력 시 즉시 에러.  
  - AC2: Secure Mode ON일 때 URL 입력 시도는 ERR-SECUREMODE-URL_DISABLED.

### Run Processing & Result
- **FR-020** The system shall display run status transitions in real time via polling.  
  - AC1: 폴링 간격은 3~10초 범위 내 설정 가능(기본 5초).  
  - AC2: 네트워크 오류 시 재시도 UI 및 중단 안내가 있어야 한다.
- **FR-021** The system shall allow downloading result artifacts when status is SUCCEEDED.  
  - AC1: SUCCEEDED 이전에는 다운로드 버튼이 비활성.  
  - AC2: 클릭 시 다운로드 이벤트가 기록되어야 한다.
- **FR-023** The system shall provide viewing and downloading the Run Manifest JSON.  
  - AC1: /log 화면에서 JSON 원문을 확인 가능해야 한다.  
  - AC2: 다운로드 파일명은 `Run_Manifest_<run_id>.json` 규칙을 따른다.
- **FR-024** The system shall support creating/editing Discard Knowledge cards in semi-automatic mode by default.  
  - AC1: FAILED 또는 Discard 발생 시 CTA가 노출되어야 한다.  
  - AC2: 최소 필드(원인/증상/조치)가 없으면 저장 불가.

### Payment/Policy (Stub)
- **FR-030** The system shall show AI disclosure and refund/withdrawal notice before payment confirmation.  
  - AC1: 결제/제출 CTA 활성화 전에 체크박스(필수)가 있어야 한다.  
  - AC2: /policies로 이동 가능한 경로가 명확해야 한다.
- **FR-031** The system shall start a run only after “payment success” (stub event) is confirmed.  
  - AC1: v0.1에서는 “결제 성공” 버튼/토글로 대체 가능(DEC)하되 흐름은 동일해야 한다.  
  - AC2: 결제 성공 이전에는 RUNNING으로 전환되지 않아야 한다.

---

## [11] Non‑Functional Requirements (NFR)

- **NFR-SEC-001** The system shall not use `eval`, `innerHTML`, or `dangerouslySetInnerHTML` in the frontend code.  
  - AC1: 코드 검색으로 0건이어야 한다.  
  - AC2: 예외가 필요하면 DEC를 작성하고 대체안을 포함해야 한다.
- **NFR-SEC-002** The system shall apply safe external link rules (`target=_blank` with `rel=noopener noreferrer`).  
  - AC1: 외부 링크 컴포넌트는 단일 유틸로만 렌더링.  
  - AC2: lint 또는 간단한 체크로 위반을 검출 가능해야 한다.
- **NFR-PRIV-001** The system shall avoid logging raw user-provided document text and store only metadata/hashes.  
  - AC1: telemetry/log payload에 원문 필드가 없어야 한다.  
  - AC2: 파일은 name/size/type/sha256(옵션)만 기록.
- **NFR-A11Y-001** The system shall allow completing the wizard using keyboard only.  
  - AC1: 탭 순서가 논리적이어야 한다.  
  - AC2: 모달 사용 시 포커스 트랩/ESC 닫기/aria-modal 준수.
- **NFR-REL-001** The system shall keep run/profile/ruleset versions in a single contracts module.  
  - AC1: 상수/enum은 `src/contracts/*` 단일 소스.  
  - AC2: 다른 모듈에서 문자열 하드코딩 금지(리뷰 체크).

---

## [12] Error Codes (UI Mapping) — Locked

| Code | HTTP (proto) | When | UX Copy |
|---|---:|---|---|
| ERR-UPLOAD-UNSUPPORTED | 422 | 허용되지 않은 형식 | 지원하지 않는 파일 형식입니다. |
| ERR-UPLOAD-TOO_LARGE | 413 | 용량 초과 | 파일이 너무 큽니다. |
| ERR-URL-INVALID | 422 | URL 형식 오류 | URL 형식을 확인해 주세요. |
| ERR-URL-LIMIT_EXCEEDED | 422 | URL 개수 초과 | URL은 최대 N개까지 가능합니다. |
| ERR-SECUREMODE-URL_DISABLED | 409 | Secure Mode에서 URL 입력 | Secure Mode에서는 URL 입력이 제한됩니다. |
| ERR-RUN-NOT_FOUND | 404 | Run 없음/권한 없음 | 요청을 찾을 수 없습니다. |
| ERR-RUN-FAILED | 500/424 | 처리 실패 | 처리 중 오류가 발생했습니다(로그 확인). |

---

## [13] Telemetry (Minimal, v0.1)

- ui.wizard.step_viewed(step_id, profile_id)
- ui.wizard.step_completed(step_id, duration_ms)
- ui.quickpass.used(template_run_id)
- ui.securemode.enabled(enabled=true)
- run.result.downloaded(artifact_type)
- run.discard_knowledge.created/edited
- run.user_rating.submitted(1..5, optional)

원칙:
- PII/원문 금지, 메타/해시 중심
- v0.1에서는 “콘솔 + in-memory queue”로 시작 가능(DEC)

---

## [14] Test Cases (TC)

### Smoke (필수)
- **TC-SMK-01** 라우트 접근: `/`, `/app`, `/app/new`, `/policies` 로드
- **TC-SMK-02** DP‑Grant P1 Wizard 완료 → Run 생성 → SUCCEEDED → PDF 다운로드 버튼 활성
- **TC-SMK-03** DP‑RFP Secure Mode ON → URL 입력 비활성 + 안내 + Manifest enabled=true
- **TC-SMK-04** Run 상태 폴링 전환(QUEUED→RUNNING→SUCCEEDED)
- **TC-SMK-05** FAILED Run → Discard Knowledge CTA → 저장
- **TC-SMK-06** 결제 전 AI 고지/환불 고지 체크박스 없으면 제출 불가
- **TC-SMK-07** /log에서 Manifest 보기/다운로드
- **TC-SMK-08** 키보드만으로 Wizard 완료(탭/엔터/스페이스)
- **TC-SMK-09** Quick‑Pass ON → 템플릿 재사용 제출

---

## [15] DEC / OPEN / Change History

### 15.1 DEC (결정로그) — v0.1
| DEC ID | Decision | Why | Impact |
|---|---|---|---|
| DEC-TOOLCHAIN-01 | Node 24 LTS + Next 16.x + React 19.x | 최신 LTS/보안 패치 | 의존성 고정 |
| DEC-PAY-01 | 결제는 Stub(성공 버튼)으로 대체 | v0.1 속도 우선 | 실제 PG는 OPEN |
| DEC-MOCK-01 | Mock API는 앱 내부 provider로 구현 | 의존성 최소 | 향후 BE 연결 시 교체 |
| DEC-UPLOAD-LIMIT-01 | 파일 상한: 단일 50MB, 총합 150MB (v0.1) | UX/테스트 용이 | 추후 조정 가능(DEC) |
| DEC-POLL-01 | 폴링 기본 5초 | 단순/안정 | 실시간은 OPEN |

### 15.2 OPEN (오픈이슈)
- OPEN-01: 결제 PG 선택(Stripe/Toss 등) 및 세금/정산 정책
- OPEN-02: Secure Mode 실제 배포 형태(온프레미스/전용 클러스터)
- OPEN-03: Evidence Index 초기 커버리지/소스 정책
- OPEN-04: 데이터 보관 기간 기본값 및 사용자 선택 UX(삭제/보관)

### 15.3 Change History
- v0.1 (2026-02-09): v0.2.1 FE 스펙을 “Claude Code 구현용”으로 재구성(프로토타입 범위/Mock/DEC 잠금 추가)

---

## [16] Traceability Matrix (Minimal)

| UJ | Screens | FR | NFR | TC | DEC/OPEN |
|---|---|---|---|---|---|
| UJ-001 | W0~W4, RUN, RESULT, LOG | FR-001~003,010~013,020~023,030~031 | NFR-PRIV-001 | TC-SMK-02,04,06,07 | DEC-PAY-01, DEC-MOCK-01 |
| UJ-002 | W0,W2,LOG | FR-005,012,023 | NFR-SEC-001 | TC-SMK-03,07 | OPEN-02 |
| UJ-003 | APP, W1~W4 | FR-004 | NFR-REL-001 | TC-SMK-09 | — |
| UJ-004 | RESULT, LOG | FR-024 | NFR-PRIV-001 | TC-SMK-05 | — |

---

## [17] Appendix — Coverage Checks (권장)

- `lint` / `typecheck` / `build` 커맨드 및 PASS 기준을 README에 잠금
- (선택) 간단한 `coverage_check.sh`를 추가하여:
  - 모든 FR/NFR/TC ID가 문서에 존재하는지
  - 코드에 `ERR-*` 매핑이 빠지지 않았는지
  - `contracts` 단일 소스 준수 여부를 점검

끝.
