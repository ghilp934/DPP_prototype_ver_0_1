# Decision Pack Platform (DP-Grant + DP-RFP) — Web Frontend Spec (T1) v0.2.1

- Date: 2026-02-09 (KST)
- Status: Draft (Spec Lock v0.2.1)
- Audience: FE(웹) 구현 담당 / 바이브코딩 실행자 / QA
- 목표: v0.2.1 요구사항을 “결정론(DEC)”으로 잠그고, FE 구현 범위/화면/입력/에러/로그를 흔들림 없이 확정

---

## 0A) Preflight (10초 스펙 잠금)

### 0A-1. Deliverable
- 단일 FE 스펙 문서(MD): 본 문서
- 구현 산출물(예상): Web UI(Next/React 가정), API 연동, 로그/메트릭 이벤트

### 0A-2. Included / Excluded

포함(In)
- SKU 2종만 제공: **DP-Grant**, **DP-RFP**
- UX 고정: **Wizard + Progressive Disclosure(고급 옵션 접힘/노출)** + **Quick‑Pass UX(반복 제출 단축)**
- 기본 화면 5종: **입력(Wizard)** / **결제** / **처리중** / **결과** / **로그**
- 데이터 해자 v0.2.1 시작점 3종:
  1) 공개 근거 인덱스(Public Evidence Index) 노출/재사용
  2) Discard Knowledge(배제/실패 지식) 축적
  3) 프로파일-품질 상관(Profile–Quality Correlation) 수집

제외(Out)
- “전체 컨설팅” 범위(사람이 붙는 고관여 커스텀 컨설팅)
- 다중 SKU(추가 세그먼트/패키지) 확장
- 완전한 오프라인 로컬 앱 배포(단, **DP‑RFP Secure Mode**는 입력/동의/제약 UI까지만 FE 범위로 포함)
- 결제 PG/정산/세금계산서 실연동의 완전 구현(샌드박스/Stub 가능)

### 0A-3. Success Metrics (v0.2.1)
- M1: Wizard 완료율 ≥ 70% (초기 유입 기준)
- M2: “결과물 다운로드” 도달률 ≥ 40%
- M3: Quick‑Pass 이용 시 평균 제출시간 30% 단축(동일 사용자의 2회차 이상)
- M4: Run Manifest(감사/재현 JSON) 생성 성공률 ≥ 99%
- M5: Discard Knowledge 카드(자동/반자동) 생성률 ≥ 60% (실패/배제 발생 Run 기준)

### 0A-4. Constraints (Hard Locks)
- AI 고지/표시: 생성형 AI 결과물/서비스임을 명확히 고지(UX에 포함)
- 개인정보 최소수집: 입력 원문은 기본 “최소 보관/짧은 보관/즉시 삭제 옵션”을 UX로 강제
- 보안: 파일 업로드/URL 처리(SSRF 포함) 리스크는 **요구사항(DoD)** 로 내장
- 재현성: Profile/Ruleset/VersionLock이 Run Manifest에 반드시 기록

---

## 0B) LOCK Register (v0.2.1)

| Lock ID | 잠금 항목 | 값(결정) | 이유(Why) | 부작용/Trade-off |
|---|---|---|---|---|
| LOCK-SKU-01 | SKU | DP-Grant, DP-RFP **2개만** | 집중/혼선 제거 | 매출/세그먼트 확장 지연 |
| LOCK-UX-01 | 핵심 UX | Wizard + Progressive Disclosure | 초보/전문가 동시 수용 | 설계 복잡도 증가 |
| LOCK-UX-02 | Quick‑Pass | “최근 Run 템플릿 재사용” + “필수만 빠른 제출” | 반복 제출 팀의 시간 절감 | 초보자에게 혼란 → 기본 숨김(P3 위주) |
| LOCK-PROFILE-01 | 프로파일 | v0.2‑P1/P2/P3 | 품질 상관 수집/결정론 | 옵션 폭 제한 |
| LOCK-ADV-01 | 고급 접힘 규칙 | 프로파일×Wizard 단계별 1:1 매핑 | UX 흔들림 제거 | 추후 확장 시 DEC 필요 |
| LOCK-MOAT-01 | 데이터 해자 | Evidence Index + Discard Knowledge + Profile‑Quality | “근거/감사/재현” 방어축 강화 | 초기 구축 비용 |
| LOCK-RFP-SEC-01 | Secure Mode | DP‑RFP에 “Secure Mode(로컬/에어갭)” 입력 옵션 | 고보안 고객/입찰 대응 | 기능 제한(일부 자동 수집 불가) |
| LOCK-LOG-01 | Run Manifest | 모든 Run에 Manifest JSON 1개 생성 | 감사/재현/분쟁 방어 | 저장/보관 정책 설계 필요 |
| LOCK-REFUND-01 | 환불/청약철회 UX | 디지털콘텐츠 특성 반영: 구매 전 고지 + 시험/샘플 + 동의 UI | 분쟁률↓ | 구매 전 마찰↑ |

---

## 1) Overview

Decision Pack Platform은 **“근거가 붙은 의사결정 패키지(Decision Pack)”** 를 자동 생성/검증 가능한 형태로 제공한다.
v0.2.1의 FE는 “생성”이 아니라 **근거/감사/재현** 을 제품 기능으로 노출하는 데 집중한다.

---

## 2) Users & JTBD (S1+S2)

- S1: 정부지원사업/창업/R&D “지원서류 반복 제출” 팀(DP‑Grant)
  - JTBD: “지원서 초안+근거+리스크를 매번 새로 만들지 않고, 제출 가능한 품질로 빠르게 반복 생산하고 싶다.”
- S2: RFP/입찰 대응 팀(DP‑RFP)
  - JTBD: “RFP 요구사항을 빠짐없이 커버하고, 근거/제약/가정이 추적 가능한 제안서를 재현 가능하게 만들고 싶다.”

---

## 3) IA / Routes

- / : 랜딩
- /app : 대시보드(최근 Run, 새로 만들기)
- /app/new : Wizard (W0~W4)
- /app/pay/:runId : 결제(또는 W4 내 결제 모달)
- /app/run/:runId : 처리중/결과(상태에 따라 뷰 전환)
- /app/run/:runId/log : 로그/감사(Manifest 포함)
- /policies : 약관/개인정보/AI 고지/환불(요약+전문 링크)

---

## 4) Wizard (W0~W4) — Screens & Fields

### W0. SKU/프로파일/모드 선택
필수
- SKU: DP‑Grant / DP‑RFP
- Profile: P1 / P2 / P3
- Run Name(자동 제안) + 목적(짧은 설명)
- 언어/시장: KR(기본), EN(옵션)

고급(접힘, P2/P3)
- DP‑RFP: Secure Mode 토글(ON/OFF)
  - ON 시 안내: “URL 자동수집/외부 조회 제한” + “로컬/에어갭 입력 방식” 선택
- AI 고지/표시 동의(필수 체크): “AI 기반 생성/요약/분석 결과” 포함

### W1. 과업 컨텍스트 입력
- DP‑Grant: 사업/과제명, 공고/요강 링크(선택), 제출 형식/분량, 평가 기준(있으면)
- DP‑RFP: 발주기관/프로젝트명, 범위/요구사항, 필수 제출물, 평가 기준/가중치(있으면)

고급(P2/P3)
- Gate 프로파일 선택(엄격/표준/완화)
- “스위칭 가정(뒤집히는 가정)” 입력 슬롯(최대 5개)

### W2. 자료 입력(소스)
- 파일 업로드(필수 1개 이상 가능): PDF/DOCX/HWP(선택) + 이미지(PNG/JPG) + ZIP(금지)
- URL 입력(선택): 최대 N개(기본 30) — DP‑RFP Secure Mode ON 시 비활성화
- 입력 전처리 옵션(접힘): 언어/레이아웃/스캔 품질(간단)

고급(P2/P3)
- URL 스크리닝 Gate 상세: Access/Quality/Relevance, Discard Log 생성 ON/OFF
- 문서 OCR: PSM/프리셋(P1 스캔 / P2 촬영 / P3 스샷) 선택

### W3. 출력물 구성(Decision Pack)
필수(모두)
- 출력 형식: PDF(기본) + DOCX(옵션) + PPTX(옵션)
- 근거 수준: “최소(1개/클레임)” vs “표준(2개/클레임)”

고급(P2/P3)
- Evidence Map 출력 ON/OFF
- Run Manifest(감사/재현 JSON) 다운로드 ON(고정), 표시 위치(결과 탭/로그 탭)
- Discard Knowledge 카드 생성 모드: 자동/반자동/끄기(기본=반자동)

### W4. 리뷰/결제/제출
- 입력 요약(파일/URL/옵션)
- 비용(크레딧/팩) 표시
- 환불/청약철회 제한 고지 + 샘플 제공(가능 시)
- “제출” → 처리중 화면으로 이동

Quick‑Pass(주로 P3, 접힘)
- “이전 Run 템플릿 재사용”: 직전 Run의 W1~W3 설정을 불러오기
- “필수만 제출”: W1의 핵심 필드만 입력하면 나머지는 기본값으로 잠금(단, AI 고지/환불 고지는 항상 표시)

---

## 5) Output Artifacts (Schema)

### 5-1. 결과물 패키지(다운로드)
- Pack.pdf (필수)
- Pack.docx (옵션)
- Pack.pptx (옵션)
- Evidence.csv (옵션)
- Discard_Log.csv (옵션)
- Run_Manifest.json (필수)

### 5-2. Run Manifest JSON (요약 스키마)
- run_id, created_at, sku, profile_id, ruleset_version
- secure_mode: {"enabled": bool, "mode": "airgap"|"local"|"cloud"}
- inputs: files[] (sha256, type, pages), urls[] (canonical)
- gates: access/quality/relevance + thresholds
- generation: model_vendor(placeholder), model_version(placeholder)
- outputs: artifacts[] (type, sha256)
- audit: decisions[] (DEC IDs), warnings[]

---

## 6) Functional Requirements (FR) — ID + Acceptance Criteria

> 형식: **FR-###** (shall) / Acceptance Criteria(AC)

### Wizard/입력
- **FR-001** 시스템은 SKU 2종(DP‑Grant, DP‑RFP)만 선택 가능해야 한다.  
  - AC: SKU 드롭다운/카드는 2개만 노출, URL 파라미터로 다른 SKU 접근 시 404 또는 리다이렉트.
- **FR-002** 시스템은 프로파일(P1/P2/P3)을 선택하게 하고, 선택값을 Run Manifest에 기록해야 한다.  
  - AC: 제출 후 Run_Manifest.json에 profile_id 포함.
- **FR-003** 시스템은 “고급 옵션 접힘 규칙”에 따라, 프로파일별로 노출 필드를 제어해야 한다.  
  - AC: P1에서 P3 전용 옵션이 DOM에 렌더되지 않거나 disabled 상태(정책 고정).
- **FR-004** 시스템은 Quick‑Pass(템플릿 재사용, 필수만 제출)를 제공해야 한다(기본 숨김).  
  - AC: P3에서만 노출(또는 사용자 설정 ON), 선택 시 W1~W3 기본값 자동 채움.
- **FR-005** DP‑RFP에서 Secure Mode를 지원해야 한다.  
  - AC: Secure Mode ON 시 URL 입력 UI 비활성화 + 안내문 노출 + Manifest에 secure_mode.enabled=true.

### 업로드/URL
- **FR-010** 시스템은 파일 업로드 타입/크기를 검증하고 제한을 위반하면 에러코드를 반환해야 한다.  
  - AC: 허용 타입 외 업로드 → ERR-UPLOAD-UNSUPPORTED, 413/422 중 정책에 따라 처리.
- **FR-011** 시스템은 URL 입력 시 정규화(canonical) 및 중복 제거를 수행해야 한다.  
  - AC: utm 파라미터 차이는 동일로 간주, UI에서 1개로 병합 표시.
- **FR-012** 시스템은 URL 스크리닝 Gate(Access/Quality/Relevance) 결과를 Discard Log로 표시해야 한다.  
  - AC: 결과 화면에 “통과/제외 사유” 테이블 제공 + 다운로드 가능.

### 처리/결과
- **FR-020** 시스템은 Run 상태(QUEUED/RUNNING/SUCCEEDED/FAILED)를 실시간(폴링)으로 표시해야 한다.  
  - AC: 3~10초 폴링(설정 가능) + 네트워크 오류 시 재시도/중단 UI.
- **FR-021** 시스템은 결과물(PDF/DOCX/PPTX)을 다운로드할 수 있어야 한다.  
  - AC: SUCCEEDED 시 버튼 활성화, 해시/버전 표기.
- **FR-022** 시스템은 Evidence Map 및 출처 목록을 UI에서 열람 가능해야 한다.  
  - AC: 출처(도메인/제목/날짜/링크) 리스트 제공, 클릭 시 새 창.
- **FR-023** 시스템은 Run Manifest(JSON)를 로그 화면에서 열람/다운로드 가능해야 한다.  
  - AC: /log 탭에서 원문(JSON) 보기 + 다운로드.
- **FR-024** 시스템은 Discard Knowledge 카드(배제/실패 지식)를 생성/편집할 수 있어야 한다(반자동 기본).  
  - AC: FAILED 또는 Discard 발생 시 “카드 생성” CTA, 최소 필드(원인/증상/조치) 저장.

### 결제/정책
- **FR-030** 시스템은 결제 전 “AI 고지/표시” 및 “환불/청약철회 제한(해당 시)”을 명확히 고지해야 한다.  
  - AC: 결제 CTA 활성화 전 체크박스(필수) + 정책 링크.
- **FR-031** 시스템은 크레딧/팩 단위 가격을 표시하고, 결제 성공 시 Run이 시작되어야 한다.  
  - AC: 결제 성공 웹훅(또는 Stub) 수신 시 RUNNING 전환.

---

## 7) Non‑Functional Requirements (NFR)

- **NFR-SEC-001** 업로드 보안: 실행파일/압축폭탄/이중확장자 차단, 서버 스캐닝 훅(또는 외부 AV) 연동을 전제한다.  
- **NFR-SEC-002** SSRF 방지: URL Fetch는 allowlist/denylist + IP 대역 차단(내부망/메타데이터) + 리다이렉트 상한.  
- **NFR-PRIV-001** 개인정보 최소수집: 입력 원문은 기본 “짧은 보관/즉시 삭제 옵션”을 제공하고, 기본값은 최소 보관으로 한다.  
- **NFR-A11Y-001** Wizard는 키보드만으로 완료 가능해야 한다(포커스/ARIA).  
- **NFR-PERF-001** 초기 로드 LCP 2.5s 목표(초기 MVP, 측정/완화 계획 포함).  
- **NFR-REL-001** 결과물 다운로드 링크는 만료/권한검사를 포함(서명 URL 등).  

---

## 8) Error Codes (Front)

| Code | HTTP | When | UX Copy(요약) |
|---|---:|---|---|
| ERR-UPLOAD-UNSUPPORTED | 422 | 허용되지 않은 파일 형식 | “지원하지 않는 파일 형식입니다.” |
| ERR-UPLOAD-TOO_LARGE | 413 | 파일/총합 용량 초과 | “파일이 너무 큽니다.” |
| ERR-URL-INVALID | 422 | URL 형식 오류 | “URL 형식을 확인해 주세요.” |
| ERR-URL-LIMIT_EXCEEDED | 422 | URL 개수 상한 초과 | “URL은 최대 N개까지 가능합니다.” |
| ERR-SECUREMODE-URL_DISABLED | 409 | Secure Mode에서 URL 입력 시도 | “Secure Mode에서는 URL 입력이 제한됩니다.” |
| ERR-RUN-NOT_FOUND | 404 | Run 없음/권한 없음 | “요청을 찾을 수 없습니다.” |
| ERR-RUN-FAILED | 500/424 | 처리 실패 | “처리 중 오류가 발생했습니다(로그 확인).” |

---

## 9) Telemetry (Profile–Quality Correlation)

수집 이벤트(예시)
- ui.wizard.step_viewed (step_id, profile_id)
- ui.wizard.step_completed (duration_ms)
- ui.quickpass.used (template_run_id)
- ui.securemode.enabled
- run.result.downloaded (artifact_type)
- run.discard_knowledge.created/edited
- run.user_rating.submitted (1~5, optional)

원칙
- 입력 원문/본문 로그 금지(메타/해시 중심)
- PII 가능 필드는 최소화(필요 시 별도 동의)

---

## 10) Advanced Folding Rules (v0.2.1) — Profile × Step

> “Advanced 접힘 규칙”은 **프로파일 팩(P1/P2/P3)** 과 Wizard 단계(W0~W4)를 1:1로 매핑한다.

- P1 (Fast / Novice)
  - W0: Secure Mode 숨김, Quick‑Pass 숨김
  - W1: 스위칭 가정 슬롯 숨김
  - W2: Gate 상세 숨김, OCR 프리셋은 1개(자동)
  - W3: Evidence Map/Discard 모드 숨김(기본값)
  - W4: 정책 고지 요약만(전문 링크)

- P2 (Standard)
  - W0: Secure Mode(설명 포함) 노출(단, DP‑RFP만)
  - W1: 스위칭 가정 슬롯(최대 3)
  - W2: Gate 프리셋(엄격/표준/완화) 선택
  - W3: Evidence Map ON/OFF, Discard 모드(자동/반자동)
  - W4: 정책 요약 + 핵심 체크박스

- P3 (Power / Pro)
  - W0: Secure Mode + Quick‑Pass(접힘)
  - W1: 스위칭 가정(최대 5) + 커스텀 필드
  - W2: Gate 임계값 상세 + URL 정규화 옵션 표시(기본 ON)
  - W3: Evidence 깊이/출력 스키마(고급) 노출
  - W4: 결제 전 “Manifest 포함 내역” 상세 표시

---

## 11) QA Checklist (Smoke)

- SMK-01: DP‑Grant P1로 Wizard 완료 → PDF 다운로드
- SMK-02: DP‑RFP Secure Mode ON → URL 입력 비활성 → 제출 → Manifest 확인
- SMK-03: URL 중복 2개 입력 → 1개로 병합 표시
- SMK-04: 업로드 제한 위반(확장자) → ERR-UPLOAD-UNSUPPORTED
- SMK-05: FAILED Run 생성 → Discard Knowledge 카드 CTA 노출/저장

---

## 12) OPEN Issues (v0.2.1 유지)

- OPEN-01: 결제 PG 선택(토스/스트라이프 등) 및 세금 처리 정책
- OPEN-02: Secure Mode의 실제 배포 형태(별도 온프레미스 vs 전용 클러스터)
- OPEN-03: Evidence Index의 초기 커버리지(정부/조달/RFP 표준문서)
- OPEN-04: 데이터 보관 기간(기본값) 및 사용자 선택 UI(삭제/보관)

---

## 13) Change History

- v0.2 → v0.2.1
  - Quick‑Pass UX 추가(템플릿 재사용/필수만 제출)
  - DP‑RFP Secure Mode 입력 옵션 추가(로컬/에어갭 고려)
  - Discard Knowledge(배제/실패 지식) 카드/루틴 UI 추가
  - Run Manifest(JSON) 다운로드/표시 경로 고정(결과/로그)
  - Telemetry(프로파일‑품질 상관) 이벤트 스키마 최소 세트 잠금

---

## References (기획/보안/규제 힌트)
- Progressive Disclosure 패턴: NN/g, GOV.UK Design System
- OWASP: File Upload, SSRF, LLM/GenAI Top 10
- KR: AI 고지/표시, 개인정보 국외이전, 디지털콘텐츠 청약철회 제한(정책/약관/UX 반영)

