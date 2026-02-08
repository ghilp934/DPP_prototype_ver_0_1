# Decision Pack Platform — Frontend Prototype v0.1 — CLAUDE.md

Purpose
- Build **Decision Pack Platform Frontend Prototype v0.1** via Claude Code with strict adherence to Tech Spec.
- This file is the **single source of persistent project instructions** (do not rely on chat history).
- Primary goal: **근거/감사/재현성** UX 구현 (not just generation).

Run Mode (every task)
- **Plan → implement → run checks → report** (files + commands + results).
- Keep diffs small and verifiable (prefer **one page/module per change-set**).

Non-negotiables (LOCK Register — Tech Spec v0.2.1)

Source of Truth
- Primary Spec: `Decision_Pack_Platform_FE_Spec_T1_v0_2_1.md`
- Prototype Spec: `Decision_Pack_Platform_FE_Prototype_v0_1_Spec.md`
- Mock Strategy: `MOCK_DATA_PERSISTENCE_STRATEGY_v0_1.md`
- Project Guide: Memory → `DPP_PROJECT_GUIDE.md`

LOCK-SKU-01: SKU (Product Types)
- **ONLY** DP-Grant and DP-RFP are allowed.
- Any other SKU reference in code/UI/routes → IMMEDIATE FAIL.

LOCK-UX-01: Core UX Pattern
- **Wizard (W0~W4) + Progressive Disclosure** (profile-based field folding).
- Deviation from this pattern requires explicit DEC approval.

LOCK-UX-02: Quick-Pass
- "Template reuse + essential-only submit" (hidden by default, P3 mainly).
- Must persist previous Run data in LocalStorage for reuse.

LOCK-RFP-SEC-01: Secure Mode
- DP-RFP only: URL input DISABLED when Secure Mode ON.
- Manifest MUST record `secure_mode.enabled=true`.

LOCK-LOG-01: Run Manifest
- Every Run generates a **Run_Manifest.json** (감사/재현용).
- Manifest download is MANDATORY (not optional).

LOCK-PRIV-01: Privacy UX
- Minimal collection: NO raw file content logging (metadata/hash ONLY).
- Short retention + immediate delete option enforced in UX.

LOCK-SEC-UI-01: FE Security Bans
- **FORBIDDEN**: `eval`, `new Function`, `innerHTML`, `dangerouslySetInnerHTML`.
- Violation = IMMEDIATE FAIL (code review gate).

LOCK-STATE-01: State Machine
- Run status transitions ONLY via single state machine: `QUEUED → RUNNING → SUCCEEDED/FAILED`.
- No ad-hoc status mutations outside state machine.

LOCK-ERR-01: Error Codes
- Error codes table is LOCKED (see `src/contracts/errorCodes.ts`).
- ERR-UPLOAD-UNSUPPORTED, ERR-UPLOAD-TOO_LARGE, ERR-URL-INVALID, ERR-URL-LIMIT_EXCEEDED,
  ERR-SECUREMODE-URL_DISABLED, ERR-RUN-NOT_FOUND, ERR-RUN-FAILED.

LOCK-TOOLS-01: Toolchain Baseline
- Node.js: **24.x LTS (Krypton)**
- Framework: **Next.js 16.x (App Router)**
- React: **19.x** (new JSX transform, no PropTypes)
- Language: **TypeScript** (strict mode)
- UI: **Tailwind CSS 3.x + shadcn/ui**
- State: React Context + useReducer (no external state libs for v0.1)
- Mock: In-app provider (LocalStorage + In-Memory)

Security-First (NFR-SEC-001, NFR-SEC-002)
- NO `eval` / `new Function` / `innerHTML` / `dangerouslySetInnerHTML`.
- External links: `target="_blank"` MUST include `rel="noopener noreferrer"`.
- File upload validation: type + size (FE layer).
- URL canonicalization: strip utm_* params.

Privacy (NFR-PRIV-001)
- Never log raw user-provided document text.
- Store ONLY: filename, size, type, sha256 (metadata).
- URL storage: canonical form only.

Sensitive files / secrets
- Never read or print `.env*` files or secrets directories.
- Use **`.env.example`** to document required variables (no real secrets).

Stop rule (3-strike)
- If the same approach fails **3 times**, stop and propose an alternative with OPEN/DEC.
- Environmental constraints (e.g., Windows EISDIR) → pivot after 1~2 attempts.

Environment (LOCK-TOOLS-01)
- Package manager: detect by lockfile and stick to it:
  - `pnpm-lock.yaml` → pnpm
  - `package-lock.json` → npm
  - `yarn.lock` → yarn
- Expected scripts: `format`, `lint`, `typecheck`, `test`, `build`, `dev`
- Next.js: **16.x (App Router)** — NO Pages Router usage
- Quality tooling: ESLint (flat config), Prettier, EditorConfig, TypeScript strict mode

Project roots & paths
- Project root: `D:\Claude 프로젝트\dpp_v2_fe_layout`
- Claude Code settings: `.claude/settings.json`
- Spec documents:
  - Primary Spec: `Decision_Pack_Platform_FE_Spec_T1_v0_2_1.md`
  - Prototype Spec: `Decision_Pack_Platform_FE_Prototype_v0_1_Spec.md`
  - Mock Strategy: `MOCK_DATA_PERSISTENCE_STRATEGY_v0_1.md`
- Routes (IA):
  - `/` : Landing
  - `/app` : Dashboard (recent Runs, new Run)
  - `/app/new` : Wizard (W0~W4)
  - `/app/pay/:runId` : Payment (Stub)
  - `/app/run/:runId` : Processing/Result (status-based view)
  - `/app/run/:runId/log` : Log/Audit (Manifest included)
  - `/policies` : Terms/Privacy/AI Disclosure/Refund
- Folder structure (App Router):
  - `src/app/*` : routes
  - `src/components/*` : shared UI
  - `src/features/wizard/*` : step-by-step forms/validation
  - `src/features/run/*` : run state/hooks/components
  - `src/lib/*` : mockApi, storage, validators, telemetry
  - `src/contracts/*` : types (single source of truth)
- Mock API: In-app provider (see `MOCK_DATA_PERSISTENCE_STRATEGY_v0_1.md`)
  - POST /api/runs → create Run (QUEUED)
  - GET /api/runs/:runId → status/summary
  - GET /api/runs/:runId/artifacts → artifacts list
  - GET /api/runs/:runId/manifest → manifest JSON
  - POST /api/runs/:runId/discard-knowledge → save card

Working agreements

Before coding (MANDATORY)
1) Read at least **2 existing patterns** in the repo (if any exist).
2) Confirm **Mock data strategy**: LocalStorage (persistent) + In-Memory (runtime).
3) Confirm **contract types** in `src/contracts/` (if missing, create with DEC).
4) Confirm package manager from lockfile/package.json.
5) List **OPEN questions** up front (do not guess business logic).

Progressive Disclosure Rules (LOCK-UX-01)
- Profile-based field visibility:
  - **P1 (Fast/Novice)**: minimal options, Secure Mode HIDDEN, Quick-Pass HIDDEN
  - **P2 (Standard)**: moderate options, Secure Mode visible (DP-RFP only)
  - **P3 (Power/Pro)**: all advanced options, Quick-Pass visible
- Implement via feature flags keyed by `profile_id`: see `PROFILE_FEATURES` constant.
- Folding rules apply per Wizard step (W0~W4).

During coding
- **Next.js 16 App Router** structure:
  - `src/app/*` : pages (route segments)
  - `src/components/ui/*` : shadcn/ui components
  - `src/components/shared/*` : common UI
  - `src/features/wizard/*` : W0~W4 steps + validation
  - `src/features/run/*` : run state machine + hooks
  - `src/lib/mockApi.ts` : Mock API provider
  - `src/lib/storage.ts` : LocalStorage utilities
  - `src/lib/validators.ts` : input validation
  - `src/lib/telemetry.ts` : event logging (v0.1: console + in-memory queue)
  - `src/contracts/*` : types/constants (SINGLE SOURCE OF TRUTH)
- Exports: **named exports ONLY** (no default exports).
- Constants: centralize magic strings/numbers into `src/contracts/constants.ts`.
- Types: define ALL request/response types; **NO `any`**; validate unknown API payloads.
- State: React Context + useReducer for Run state machine.
- State persistence: LocalStorage for dashboard/manifest/cards, In-Memory for polling state.
- Dependencies: avoid adding new deps unless necessary; document why in DEC.

Milestones (MS-1 ~ MS-5)

MS-1: Skeleton
- Routes/Layout/Constants + Policy pages + Dashboard
- Pass TC: TC-SMK-01 (route access), TC-SMK-06 (policy disclosure)
- Files: `src/app/*`, `src/contracts/*`, `src/components/shared/Layout.tsx`

MS-2: Wizard W0~W4 + Progressive Disclosure
- W0 (SKU/Profile/Mode), W1 (Context), W2 (Sources), W3 (Output), W4 (Review/Pay)
- Input validation + Error code mapping
- Pass TC: TC-SMK-02 (Grant P1 complete), TC-SMK-03 (RFP Secure Mode)
- Files: `src/features/wizard/*`, `src/lib/validators.ts`, `src/contracts/errorCodes.ts`

MS-3: Run Flow + Mock API + State Machine
- Mock API (status transitions via timer)
- Processing/Result screens
- Pass TC: TC-SMK-04 (SUCCEEDED download), TC-SMK-05 (FAILED → Discard CTA)
- Files: `src/lib/mockApi.ts`, `src/lib/storage.ts`, `src/features/run/*`

MS-4: Log/Manifest Viewer + Telemetry
- Manifest JSON viewer (fold/copy/download)
- Event timeline (minimal telemetry)
- Pass TC: TC-SMK-07 (Manifest view/download)
- Files: `src/app/run/[runId]/log/page.tsx`, `src/lib/telemetry.ts`

MS-5: Polish (A11y + Performance + Lint)
- Keyboard-only navigation (TC-SMK-08)
- Security check (grep for eval/innerHTML → 0 results)
- Lint/Typecheck/Build all PASS
- Pass TC: TC-SMK-08 (keyboard-only Wizard completion)

After each milestone
- Run **Definition-of-Done checks** (see below).
- Update `IMPLEMENTATION_SUMMARY.md` with:
  - What changed, why
  - Files changed
  - Commands run + results
  - OPEN + DEC

Security & Quality Gates (GO/NO-GO)
- No secret reads/logging (`.env*`, `secrets/**`).
- No `eval` / `new Function`.
- No unsanitized HTML injection (`dangerouslySetInnerHTML` requires sanitize + explicit note).
- `target="_blank"` links include `rel="noopener noreferrer"`.
- If embedding via iframe is introduced: document CSP plan (`frame-ancestors`, `frame-src`, `default-src`) in OPEN/DEC.

UI/UX & accessibility baseline
- Icon-only buttons: `aria-label`.
- Modals: `role="dialog"`, `aria-modal="true"`, ESC closes, focus management.
- Touch targets: >= 44×44 px where applicable.
- z-index system (recommend):
  - z-10 content
  - z-20 badges/labels
  - z-40 backdrop
  - z-50 header/sidebar
  - z-60 modal/lightbox

Definition of Done (per milestone/task)

Code Quality Gates
- `npm run format` (or pnpm/yarn): PASS (if script exists)
- `npm run lint`: PASS (0 errors)
- `npm run typecheck`: PASS (0 errors)
- `npm run test`: PASS (if test suite exists)
- `npm run build`: PASS (production build succeeds)

Security Gates (MANDATORY)
- Grep check: `eval(` → 0 results
- Grep check: `innerHTML` → 0 results
- Grep check: `dangerouslySetInnerHTML` → 0 results
- External links: ALL have `rel="noopener noreferrer"`

Smoke Test (TC-SMK-*)
- TC-SMK-01: Route access (/, /app, /app/new, /policies)
- TC-SMK-02: DP-Grant P1 Wizard → Run creation → PDF download
- TC-SMK-03: DP-RFP Secure Mode → URL disabled → Manifest check
- TC-SMK-04: Run status polling (QUEUED→RUNNING→SUCCEEDED)
- TC-SMK-05: FAILED Run → Discard Knowledge card creation
- TC-SMK-06: Payment disclosure (AI notice + refund policy checkboxes)
- TC-SMK-07: Manifest view/download at /log
- TC-SMK-08: Keyboard-only Wizard completion (Tab/Enter/Space)
- (TC-SMK-09: Quick-Pass template reuse — MS-3+)

Prototype v0.1 Complete Criteria (Final DoD)
- **Wizard complete** → **Run created** → **Status transitions** (QUEUED→RUNNING→SUCCEEDED/FAILED)
  → **Result download** → **Manifest view/download** → **ALL Smoke Tests PASS**

Documentation
- `IMPLEMENTATION_SUMMARY.md` updated with:
  - Summary of changes
  - Files changed
  - Commands run (format/lint/typecheck/build)
  - Smoke test results
  - OPEN items (blockers/ambiguities)
  - DEC items (design decisions with rationale)

Reporting template (copy/paste)
```markdown
## Milestone/Task Summary
- **Milestone**: MS-# (Name)
- **Status**: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL
- **Summary**: [Brief description of what was implemented]

## Files Changed
- `src/app/...` : [description]
- `src/features/...` : [description]
- `src/lib/...` : [description]
- `src/contracts/...` : [description]

## Commands Run (DoD)
```bash
npm run format  # PASS/FAIL
npm run lint    # PASS/FAIL
npm run typecheck  # PASS/FAIL
npm run build   # PASS/FAIL
grep -r "eval(" src/  # 0 results
grep -r "innerHTML" src/  # 0 results
```

## Smoke Test Results
- TC-SMK-01: ✅ PASS / ❌ FAIL
- TC-SMK-02: ✅ PASS / ❌ FAIL
- (list all relevant TCs)

## LOCK Compliance
- LOCK-SKU-01: ✅ Verified (only DP-Grant/DP-RFP)
- LOCK-UX-01: ✅ Verified (Wizard + Progressive Disclosure)
- LOCK-SEC-UI-01: ✅ Verified (no eval/innerHTML)
- (list all relevant LOCKs)

## OPEN Items
- OPEN-001: [Description of blocker/ambiguity]
- OPEN-002: [Description]

## DEC Items
- DEC-001: [Decision title]
  - WHY: [Reason for decision]
  - WHAT: [What was decided]
  - CONSEQUENCES: [Trade-offs/implications]

## Notes / Next Steps
- [Any additional context]
- [Recommended next milestone/task]
```

OPEN / DEC format (examples)

**OPEN Examples:**
- OPEN-001 (Blocker): Payment PG selection (Stripe vs Toss vs Sandbox-only for v0.1)
- OPEN-002 (Ambiguity): Secure Mode deployment form (on-premise vs dedicated cluster)
- OPEN-003 (Dependency): Evidence Index initial coverage (government/procurement docs)
- OPEN-004 (UX): Data retention default period (30/60/90 days + user choice UI)

**DEC Examples:**
- DEC-TOOLCHAIN-01: Node 24 LTS + Next 16.x + React 19.x
  - WHY: Latest LTS for security patches + future-proof
  - WHAT: Lock toolchain versions in package.json#engines
  - CONSEQUENCES: Dependency updates require careful testing
- DEC-PAY-01: Payment is Stub (success button) for v0.1
  - WHY: Prototype speed over real PG integration
  - WHAT: Mock "payment success" event to trigger Run start
  - CONSEQUENCES: Real PG integration is OPEN-001 for v0.2+
- DEC-MOCK-01: Mock API is in-app provider (not external service)
  - WHY: Minimize dependencies for v0.1
  - WHAT: LocalStorage + In-Memory state (see MOCK_DATA_PERSISTENCE_STRATEGY)
  - CONSEQUENCES: Easy BE transition but no multi-device sync in v0.1
- DEC-UPLOAD-LIMIT-01: File limits = 50MB single / 150MB total (v0.1)
  - WHY: UX testing + avoid LocalStorage bloat
  - WHAT: FE validation at upload time
  - CONSEQUENCES: Adjustable via constants, backend may enforce different limits
- DEC-POLL-01: Polling interval = 5 seconds (default)
  - WHY: Simple/stable for v0.1 prototype
  - WHAT: Configurable via .env (NEXT_PUBLIC_POLL_INTERVAL)
  - CONSEQUENCES: Real-time via WebSocket is OPEN for v0.2+

**LOCK Violation → FAIL:**
- If SKU other than DP-Grant/DP-RFP is introduced → IMMEDIATE FAIL (LOCK-SKU-01)
- If eval/innerHTML found in code → IMMEDIATE FAIL (LOCK-SEC-UI-01)
- If Run status mutation bypasses state machine → IMMEDIATE FAIL (LOCK-STATE-01)
