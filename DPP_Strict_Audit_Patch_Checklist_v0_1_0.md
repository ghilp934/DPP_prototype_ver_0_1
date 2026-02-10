# DPP Frontend Prototype v0.1 — Strict Auditor Patch Checklist (v0.1.0)

목표: 데모/내부 시연에서 “절대 터지지 않는” 안정성과, 다음 단계(백엔드 연동/프로덕션 전환)에서 발목 잡힐 만한 구조적 리스크 제거.
범위: 이번 ZIP 기준 소스코드 + 동봉 문서(Spec/Implementation Summary).

Severity 규칙
- P0: 데모/빌드/핵심 플로우를 깨뜨릴 수 있음 (즉시 수정)
- P1: 기능은 되지만 유지보수·확장·신뢰성에 큰 부채 (가급적 이번 라운드에)
- P2: 폴리시/가독성/일관성 개선 (시간 되면)

────────────────────────────────────────────────────────
P0-1) “새로고침/탭 종료” 시 RUNNING/QUEUED가 영구 정지(stuck)되는 문제
- 증상:
  - Run 생성 후 처리 중(QUEUED/RUNNING)에 새로고침하면, in-memory 타이머가 사라져 상태 전이가 멈출 수 있음.
  - 결과: 데모 중 폴링이 영원히 “RUNNING”에서 멈춤.
- 근거:
  - src/lib/mockApi.ts: getRun()은 runStatusMap에 최신값이 있을 때만 병합. 없으면 LocalStorage의 status를 그대로 반환.
- 수정 지시:
  A안(권장: 결정론적/복구 용이)
  - created_at 기반으로 “가상 상태 머신”을 재계산:
    - elapsed < T1: QUEUED
    - T1 ≤ elapsed < T2: RUNNING
    - elapsed ≥ T2: SUCCEEDED(또는 시드 기반으로 FAILED)
  - getRun() 호출 시 위 규칙으로 status를 재계산하고, LocalStorage(run.updated_at 포함) 동기화.
  - 장점: 타이머/메모리 의존 0, 새로고침/다중탭에도 일관.
  B안(빠른 패치)
  - getRun()에서 memoryStatus가 없고 run.status가 QUEUED/RUNNING이면 scheduleStatusTransition(runId)을 “재스케줄”
  - 단, 중복 타이머 방지용 guard(예: runStatusMap에 “scheduled” 플래그)를 추가.

────────────────────────────────────────────────────────
P0-2) mockApi.createRun()이 WizardState를 직접 mutate 하는 문제(React state 불변성 위반 가능)
- 증상:
  - secureMode일 때 inputs.sources.urls = []로 직접 변경.
  - WizardState 객체가 React state 참조를 공유하면, 제출 이후 UI/상태가 예측불가하게 바뀔 수 있음(불변성 위반).
- 근거:
  - src/lib/mockApi.ts (createRun): inputs.sources.urls = [];
- 수정 지시:
  - inputs를 절대 mutate 하지 말 것.
  - sanitizeInputs = deepClone(inputs) 후, secureMode면 sanitizeInputs.sources.urls = [] 적용.
  - createRun은 sanitizeInputs로 manifest/run을 생성.

────────────────────────────────────────────────────────
P0-3) Dashboard 요구사항(최근 Runs 리스트/재진입 UX) 미구현 또는 문서/스펙과의 불일치
- 증상:
  - Spec(S-APP-01)에 “최근 Runs 리스트 + 클릭 시 상세/로그 이동”이 명시돼 있으나, 현재 /app 대시보드는 안내 카드 중심.
  - 결과: Run을 만든 뒤 다시 찾는 UX가 약하고, 데모 중 재진입 내비게이션이 취약.
- 근거:
  - Decision_Pack_Platform_FE_Prototype_v0_1_Spec.md S-APP-01
  - src/app/app/page.tsx (Run list 미표시)
  - src/lib/storage.ts getRunsList()는 존재하지만 사용처가 없음.
- 수정 지시:
  - 대시보드를 client component로 전환(또는 client 하위 컴포넌트 추가)
  - useEffect에서 storage.getRunsList() 로드 → table/list 렌더
  - 각 run row에서 /app/run/[runId], /app/run/[runId]/log 링크 제공
  - 상태 배지/created_at 표시 + “삭제(옵션)” 버튼(필요 시 storage.deleteRun) 추가

────────────────────────────────────────────────────────
P1-1) Spec/문서 드리프트(“문서가 진실이어야 한다”)
- 증상:
  - Spec에는 W0에서 “AI Consent”가 언급되는데 실제 구현은 W4에서 동의 체크.
  - Log/Manifest 스펙(Discard Log/Telemetry timeline)이 문서와 UI 구현 사이에서 어긋나 있음(현재는 Manifest 중심).
- 수정 지시:
  - (선택1) 구현을 Spec에 맞추기(동의 체크 위치, Log 페이지 섹션 추가 등)
  - (선택2) Spec을 현재 v0.1 구현에 맞게 업데이트(“v0.1 범위”를 명시)
  - 최소: “현재 v0.1에서 구현된 항목 / 미구현 항목”을 Spec 맨 앞에 1페이지 표로 고정

────────────────────────────────────────────────────────
P1-2) 폴링/요청 중복 및 레이스 컨디션 완화
- 증상:
  - 폴링 주기보다 fetch가 느리면 중복 호출이 겹칠 수 있음.
  - 상태 전이 직후 UI가 깜빡이는 현상 발생 가능.
- 수정 지시:
  - 폴링 시 inFlight guard(요청 중이면 skip)
  - 상태가 terminal(SUCCEEDED/FAILED)이면 즉시 폴링 종료
  - 가능하면 “server timestamp 기반”으로 상태 변화 판단(= P0-1 A안과 결합)

────────────────────────────────────────────────────────
P1-3) 로딩/에러 UX의 일관성(알림/alert 제거)
- 증상:
  - 일부 페이지에서 alert 사용(복사 실패 등)
- 수정 지시:
  - 공통 Toast 컴포넌트(또는 inline error)로 통일
  - “사용자 행동 실패”는 UI 내에서 복구 가능하게(재시도 버튼)

────────────────────────────────────────────────────────
P2-1) README 정리(외부 리뷰/온보딩 효율)
- 증상:
  - README.md가 create-next-app 기본 템플릿 상태(프로젝트 설명/경로/시연 플로우가 부족)
- 수정 지시:
  - 1) 프로젝트 목적(Decision Pack Platform v0.1) 2) 데모 시나리오 3) 핵심 경로(/app → /app/new → /app/run/:id → /log) 4) Mock persistence 한계/주의사항을 추가

────────────────────────────────────────────────────────
P2-2) mockApi 타이머/메모리 정리(작은 누수 방지)
- 증상:
  - deleteRun 등으로 Run을 제거해도 runStatusMap 키가 남을 수 있음
- 수정 지시:
  - updateRunStatus에서 run이 없으면 runStatusMap.delete(runId)
  - (선택) scheduleStatusTransition의 타이머 id를 맵으로 저장해 cancel 가능하게

────────────────────────────────────────────────────────
Done Criteria (이번 라운드)
- P0 3개 전부 해결(특히 Refresh-stuck)
- /app 대시보드에서 “최근 Runs 재진입”이 가능
- Spec 또는 구현 중 하나가 “단일 진실(Single Source of Truth)” 상태로 정리됨
