# Mock 데이터 생명주기 (Persistence) 전략 — Prototype v0.1

**문서 버전**: v0.1
**작성일**: 2026-02-09
**목적**: v0.1 프로토타입에서 Mock 데이터의 저장/관리 전략을 명확히 정의

---

## 🚨 현재 스펙의 문제점

### 1. **Persistence 정책 누락**
- v0.2.1 및 v0.1 스펙에서 "Mock API는 in-app provider로 구현" (DEC-MOCK-01)만 명시
- **브라우저 새로고침 시** Run 데이터 보존 여부 불명확
- Dashboard의 "최근 Run" 리스트 표시를 위한 저장소 미정의

### 2. **핵심 기능별 저장 방식 미정의**
| 기능 | 필요 데이터 | 현재 상태 |
|---|---|---|
| Dashboard | Run 리스트 (id, sku, profile, status, created_at) | ❌ 미정의 |
| Run 상태 추적 | RunStatus 전환 이력 | ❌ 미정의 |
| Manifest 다운로드 | Run_Manifest.json | ❌ 미정의 |
| Artifacts 다운로드 | Pack.pdf, Evidence.csv 등 | ❌ 미정의 |
| Discard Knowledge | 카드 목록 (원인/증상/조치) | ❌ 미정의 |
| Quick-Pass (P3) | 이전 Run 템플릿 (W1~W3 입력값) | ❌ 미정의 |

### 3. **UX 영향**
- 새로고침 시 Run 손실 → 사용자는 "처리중"이던 Run을 추적 불가
- Quick-Pass 기능 구현 불가 (템플릿 재사용을 위해선 이전 Run 보존 필수)
- Manifest/Artifacts 다운로드 시 파일 생성 방식 불명확

---

## ✅ 보완안: Hybrid Persistence 전략 (권장)

### **설계 원칙**
1. **프로토타입 목적**: BE 연동 전 "UX/화면/상태/에러" 검증
2. **실제 사용 가능**: Smoke Test 5종을 "실제로 사용 가능한 수준"으로 통과
3. **전환 용이성**: 추후 실제 API로 전환 시 최소 수정

### **저장 계층 분리**

#### Layer 1: **In-Memory (Runtime State)**
- **용도**: Run 상태머신 전환, 폴링 중 임시 상태
- **수명**: 페이지 세션 동안만 유지
- **구현**: React Context + Reducer
- **데이터**:
  - `runStatusMap: Map<runId, RunStatus>`
  - 폴링 타이머, 네트워크 재시도 카운터

#### Layer 2: **LocalStorage (Persistent State)**
- **용도**: 새로고침 후에도 유지되어야 하는 데이터
- **수명**: 브라우저 데이터 삭제 전까지 영구 보존
- **구현**: `localStorage` + JSON 직렬화
- **데이터**:
  ```typescript
  // Key: "dpp_runs"
  {
    runs: RunSummary[];  // Dashboard용 Run 리스트
    lastUpdated: string;
  }

  // Key: "dpp_run_{runId}"
  {
    run_id: string;
    inputs: WizardInputs;  // Quick-Pass용
    manifest: RunManifest;
    status: RunStatus;
    artifacts: Artifact[];
  }

  // Key: "dpp_discard_knowledge"
  {
    cards: DiscardKnowledgeCard[];
  }
  ```

#### Layer 3: **Blob Storage (Downloadable Files)**
- **용도**: 다운로드 가능한 파일 (PDF, DOCX, JSON 등)
- **수명**: 다운로드 시점에 동적 생성
- **구현**:
  - Manifest: JSON.stringify → Blob → download
  - Pack.pdf: 샘플 PDF blob (실제 생성은 v0.1 범위 밖, 더미 파일 제공)
  - Evidence.csv: 샘플 CSV 생성

---

## 📋 데이터 흐름 (CRUD)

### **Run 생성 (POST /api/runs)**
```typescript
// Mock API Handler
async function createRun(inputs: WizardInputs): Promise<RunSummary> {
  const runId = generateRunId(); // ulid 또는 nanoid

  const run: RunDetail = {
    run_id: runId,
    created_at: new Date().toISOString(),
    sku: inputs.sku,
    profile_id: inputs.profile,
    status: "QUEUED",
    inputs,
    manifest: generateManifest(inputs),
    artifacts: [],
  };

  // LocalStorage 저장
  saveRunToLocalStorage(run);
  updateRunList(run);

  // In-Memory 상태 초기화
  runStatusMap.set(runId, "QUEUED");

  // 상태 전환 타이머 시작 (QUEUED → RUNNING → SUCCEEDED/FAILED)
  scheduleStatusTransition(runId);

  return toRunSummary(run);
}
```

### **Run 조회 (GET /api/runs/:runId)**
```typescript
async function getRun(runId: string): Promise<RunDetail | null> {
  // 1. In-Memory 확인
  const memoryStatus = runStatusMap.get(runId);

  // 2. LocalStorage에서 복원
  const stored = localStorage.getItem(`dpp_run_${runId}`);
  if (!stored) return null;

  const run: RunDetail = JSON.parse(stored);

  // 3. In-Memory 상태가 더 최신이면 병합
  if (memoryStatus && memoryStatus !== run.status) {
    run.status = memoryStatus;
    saveRunToLocalStorage(run); // 동기화
  }

  return run;
}
```

### **상태 전환 (Mock State Machine)**
```typescript
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
        generateArtifacts(runId); // Artifacts 생성
      }
    }, duration);
  }, 2000);
}

function updateRunStatus(runId: string, status: RunStatus) {
  // In-Memory 업데이트
  runStatusMap.set(runId, status);

  // LocalStorage 동기화
  const run = getRun(runId);
  if (run) {
    run.status = status;
    saveRunToLocalStorage(run);
    updateRunList(run); // Dashboard 리스트 갱신
  }
}
```

### **Dashboard 최근 Run 조회**
```typescript
async function getRecentRuns(): Promise<RunSummary[]> {
  const stored = localStorage.getItem("dpp_runs");
  if (!stored) return [];

  const { runs } = JSON.parse(stored);

  // 최신순 정렬
  return runs.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10); // 최근 10개
}
```

### **Quick-Pass: 템플릿 재사용**
```typescript
async function loadTemplate(runId: string): Promise<WizardInputs | null> {
  const run = await getRun(runId);
  if (!run) return null;

  return run.inputs; // W1~W3 입력값 반환
}
```

### **Manifest 다운로드**
```typescript
function downloadManifest(runId: string) {
  const run = getRun(runId);
  if (!run) throw new Error("ERR-RUN-NOT_FOUND");

  const json = JSON.stringify(run.manifest, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Run_Manifest_${runId}.json`;
  a.click();

  URL.revokeObjectURL(url);
}
```

### **Artifacts 생성 (샘플)**
```typescript
function generateArtifacts(runId: string) {
  const artifacts: Artifact[] = [
    {
      type: "PACK_PDF",
      filename: `Pack_${runId}.pdf`,
      sha256: generateDummyHash(),
      download_url: undefined, // 클릭 시 샘플 PDF blob 생성
    },
    {
      type: "RUN_MANIFEST_JSON",
      filename: `Run_Manifest_${runId}.json`,
      sha256: generateDummyHash(),
      download_url: undefined,
    },
  ];

  const run = getRun(runId);
  if (run) {
    run.artifacts = artifacts;
    saveRunToLocalStorage(run);
  }
}
```

### **Discard Knowledge 카드 저장**
```typescript
async function saveDiscardKnowledgeCard(card: DiscardKnowledgeCard) {
  const stored = localStorage.getItem("dpp_discard_knowledge");
  const data = stored ? JSON.parse(stored) : { cards: [] };

  data.cards.push({
    ...card,
    id: generateCardId(),
    created_at: new Date().toISOString(),
  });

  localStorage.setItem("dpp_discard_knowledge", JSON.stringify(data));
}
```

---

## 🔒 제약사항 및 보안

### **LocalStorage 용량 제한**
- **상한**: 브라우저별 5~10MB (일반적으로 5MB)
- **대응**:
  - Run 데이터는 최근 50개로 제한
  - 오래된 Run은 자동 삭제 (LRU 정책)
  - 대용량 파일(PDF)은 저장하지 않고 다운로드 시 샘플 생성

### **개인정보 보호 (NFR-PRIV-001)**
- **입력 원문 로깅 금지**: LocalStorage에 파일 내용 저장 안 함
- **메타데이터만 저장**: 파일명, 크기, 타입, SHA256 해시만 기록
- **URL 원문 저장**: Canonical URL만 저장 (utm 파라미터 제거)

### **보안 고려사항**
- LocalStorage는 XSS 공격에 취약 → NFR-SEC-001 준수 필수
- `eval`, `innerHTML`, `dangerouslySetInnerHTML` 사용 금지
- 외부 링크: `target="_blank" rel="noopener noreferrer"`

---

## ✅ 구현 체크리스트

### MS-1: Skeleton
- [ ] LocalStorage 유틸 모듈 작성 (`src/lib/storage.ts`)
- [ ] Run 데이터 타입 정의 (`src/contracts/run.ts`)
- [ ] Mock API Provider 기본 구조 (`src/lib/mockApi.ts`)

### MS-2: Wizard
- [ ] Run 생성 API 구현 (POST /api/runs)
- [ ] LocalStorage에 Run 저장
- [ ] Dashboard에서 최근 Run 조회

### MS-3: Run Flow
- [ ] 상태 전환 타이머 구현
- [ ] In-Memory + LocalStorage 동기화
- [ ] 폴링 시 상태 조회 (GET /api/runs/:runId)

### MS-4: Log/Manifest
- [ ] Manifest 다운로드 (Blob 생성)
- [ ] Artifacts 샘플 생성
- [ ] Discard Knowledge 카드 저장/조회

### MS-5: Quick-Pass
- [ ] 템플릿 로드 (이전 Run 재사용)
- [ ] W1~W3 자동 채움 구현

---

## 📊 테스트 시나리오

### T1: 새로고침 후 Run 복원
1. Wizard 완료 → Run 생성 (QUEUED)
2. 브라우저 새로고침
3. **검증**: Dashboard에서 Run 확인 가능
4. Run 상세 페이지 진입 → 상태 폴링 재개

### T2: 상태 전환 추적
1. Run 생성 → QUEUED
2. 2초 후 → RUNNING
3. 5~10초 후 → SUCCEEDED/FAILED
4. **검증**: 각 상태가 LocalStorage에 기록됨

### T3: Manifest 다운로드
1. SUCCEEDED Run 진입
2. Log 화면에서 "Manifest 다운로드" 클릭
3. **검증**: `Run_Manifest_{runId}.json` 파일 다운로드

### T4: Quick-Pass
1. Run A 생성 완료
2. Dashboard에서 "Quick-Pass" 활성화
3. Run A 선택 → W1~W3 자동 채움
4. **검증**: 입력값이 Run A와 동일

### T5: 용량 제한 (Edge Case)
1. Run 100개 생성 (의도적으로 상한 초과)
2. **검증**: 오래된 Run 50개 자동 삭제
3. **검증**: 최근 50개만 LocalStorage에 유지

---

## 🔄 BE 전환 계획 (v0.2+)

### Phase 1: Mock → Hybrid
- Mock API와 실제 API를 **환경 변수로 전환** (`VITE_USE_MOCK_API`)
- Mock: LocalStorage, Real: HTTP 요청

### Phase 2: LocalStorage → 서버 DB
- Run 데이터는 서버 DB에 저장
- LocalStorage는 **캐시 레이어**로만 사용 (오프라인 대응)

### Phase 3: Polling → WebSocket
- 상태 전환을 실시간으로 수신
- 폴링 간격 제거

---

## 📖 참고 자료

- **React 19 Best Practices**: State 관리, useReducer 패턴
- **LocalStorage Patterns**: LRU 캐시, 직렬화/역직렬화
- **Blob API**: 파일 다운로드, URL.createObjectURL
- **ULID/NanoID**: 분산 환경에서 고유 ID 생성

---

**다음 작업**: 이 전략을 `src/lib/mockApi.ts` 및 `src/lib/storage.ts`에 구현
