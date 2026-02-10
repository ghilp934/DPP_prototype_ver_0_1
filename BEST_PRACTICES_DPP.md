# Best Practices — Decision Pack Platform v0.1

**Purpose**: 다음 프로젝트에 복붙 가능한 재사용 규칙/패턴/체크리스트
**Source**: DPP v0.1 Post-Audit Session (2026-02-10)
**Context**: Mock API 기반 데모 앱에서 발견된 Production-Ready 패턴

---

## BP-01: JSON 기반 deep clone 금지 (특히 File/Date/Map)

### Rule
상태/입력 객체를 깊게 복사해야 한다면 **JSON.stringify/parse로 clone 하지 말 것**. JSON으로 표현 불가능한 타입(File, Date, Map, Function 등)은 손실되거나 변형된다.

### Anti-Pattern
```typescript
// ❌ BAD: File 객체 손실
const cloned = JSON.parse(JSON.stringify(state));
// state.files[0] instanceof File → true
// cloned.files[0] instanceof File → false (빈 객체로 변환)
```

### Why
JSON 직렬화는 JSON으로 표현 가능한 값만 안정적으로 다룬다. File, Date, Map 등은 변환 과정에서 손실되거나 예상치 못한 형태로 변형된다.

### Example
```typescript
// ✅ GOOD: 타입별 명시적 복사
interface WizardState {
  files: File[];
  dates: Date[];
  metadata: Map<string, string>;
}

function deepClone(state: WizardState): WizardState {
  return {
    files: [...state.files], // File 참조 유지
    dates: state.dates.map(d => new Date(d)), // Date 재생성
    metadata: new Map(state.metadata), // Map 재생성
  };
}

// 또는 structuredClone (브라우저 지원 확인 필요)
const cloned = structuredClone(state);
```

### Test
- **재현**: File 업로드 후 상태 복사 → File 객체 보존 확인
- **검증**: `cloned.files[0] instanceof File` → true

### Reference
- MDN JSON.stringify: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
- MDN structuredClone: https://developer.mozilla.org/en-US/docs/Web/API/structuredClone

---

## BP-02: React state 불변성 — "변경은 새 객체로"

### Rule
React state를 직접 mutate 하지 말고, **새 객체/새 배열로 교체**한다. `state.field = value` 금지.

### Anti-Pattern
```typescript
// ❌ BAD: 직접 변경
setState((prev) => {
  prev.items.push(newItem); // mutate!
  return prev; // React는 재렌더링 안 함 (같은 참조)
});
```

### Why
React는 참조 비교(===)로 상태 변경을 감지한다. 같은 객체를 mutate하면 React는 변경을 인지하지 못한다.

### Example
```typescript
// ✅ GOOD: 새 배열/객체로 교체
setState((prev) => ({
  ...prev,
  items: [...prev.items, newItem], // 새 배열
}));

// 중첩 객체도 동일
setState((prev) => ({
  ...prev,
  nested: {
    ...prev.nested,
    field: newValue, // 새 객체
  },
}));
```

### Test
- **재현**: 상태 변경 후 컴포넌트 재렌더링 확인
- **검증**: React DevTools에서 상태 변경 추적

### Reference
- React Docs: https://react.dev/learn/updating-objects-in-state

---

## BP-03: Mock 상태머신 — "타이머 의존" 대신 "결정론적 복구"

### Rule
새로고침/다중탭/느린 네트워크를 고려해 **created_at 기반 상태 재계산** 같은 결정론적 전략을 기본값으로 사용한다.

### Anti-Pattern
```typescript
// ❌ BAD: 타이머만 의존
setTimeout(() => {
  updateStatus(runId, "RUNNING");
}, 2000);
// 새로고침 → 타이머 사라짐 → 상태 고착
```

### Why
타이머는 새로고침/탭 전환/네트워크 지연 시 복구 불가능하다. 데모 시연 중 새로고침은 흔한 시나리오다.

### Example
```typescript
// ✅ GOOD: created_at 기반 재계산
function computeStatusFromElapsed(runId: string, elapsedMs: number): RunStatus {
  if (elapsedMs < 2000) return "QUEUED";

  const seed = runId.charCodeAt(runId.length - 1) % 5000;
  const transitionTime = 2000 + 5000 + seed; // 7~12초

  if (elapsedMs < transitionTime) return "RUNNING";

  const successSeed = runId.charCodeAt(0) % 10;
  return successSeed < 8 ? "SUCCEEDED" : "FAILED";
}

// getRun() 호출 시마다 재계산
const elapsedMs = Date.now() - new Date(run.created_at).getTime();
const status = computeStatusFromElapsed(run.run_id, elapsedMs);
```

### Test
- **D1**: RUNNING 중 F5 → 상태 정상 전이 확인
- **D4**: 딥링크 직접 입력 → 상태 즉시 복구
- **D5**: 다중탭 → 일관된 상태

---

## BP-04: 폴링 루프 4원칙

### Rule
상태 폴링 시 다음 4가지를 반드시 구현한다:
1. **In-flight 중복 방지**: 요청 진행 중 새 요청 차단
2. **Terminal 즉시 stop**: 종료 상태 도달 시 폴링 중단
3. **Backoff/재시도**: 네트워크 실패 시 재시도 로직
4. **bfcache 복원 대응**: 뒤로가기 시 타이머 중복 방지

### Anti-Pattern
```typescript
// ❌ BAD: 중복 방지 없음
setInterval(() => {
  fetchRun(runId); // 동시 다발 요청 가능
}, 5000);
```

### Why
폴링은 레이스 컨디션, 메모리 누수, 무한 요청의 온상이다. 특히 Back/Forward 캐시(bfcache) 복원 시 타이머가 중복 생성될 수 있다.

### Example
```typescript
// ✅ GOOD: 4원칙 적용
let intervalId: NodeJS.Timeout | null = null;
let isFetching = false;

function startPolling(runId: string) {
  if (intervalId) return; // 중복 방지 (4)

  intervalId = setInterval(async () => {
    if (isFetching) return; // In-flight 방지 (1)

    isFetching = true;
    try {
      const run = await mockApi.getRun(runId);
      if (!run) {
        stopPolling(); // Run 없으면 중단
        return;
      }

      // Terminal 상태 즉시 중단 (2)
      if (run.status === "SUCCEEDED" || run.status === "FAILED") {
        stopPolling();
      }
    } catch (error) {
      // Backoff/재시도 (3)
      console.error("Polling failed, retrying...", error);
    } finally {
      isFetching = false;
    }
  }, 5000);
}

function stopPolling() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Cleanup
useEffect(() => {
  return () => stopPolling();
}, []);
```

### Test
- **D2**: SUCCEEDED 도달 → DevTools Network에서 요청 중단 확인
- **D3**: Back/Forward 3x → interval 중복 없음
- **D7**: Slow 3G → 재시도 로직 동작
- **D5**: bfcache 복원 → 타이머 중복 방지

### Reference
- bfcache: https://web.dev/articles/bfcache

---

## BP-05: 데모 앱의 "재진입 경로"는 필수

### Rule
대시보드에는 **"최근 Run 리스트 + 링크"**를 반드시 제공한다. 데모 시연 중 심사위원은 돌아간다.

### Anti-Pattern
```typescript
// ❌ BAD: Dashboard에 "새 Run 생성" 버튼만 있음
<Dashboard>
  <Button onClick={createRun}>새 Run 생성</Button>
</Dashboard>
// 이전 Run 돌아가기 불가 → 뒤로가기 의존
```

### Why
데모 시연 중 심사위원은 "이전 결과를 다시 보고 싶다"고 요청한다. 뒤로가기만 의존하면 히스토리 손실 시 복구 불가능하다.

### Example
```typescript
// ✅ GOOD: Dashboard에 Run 리스트 표시
function Dashboard() {
  const [runs, setRuns] = useState<RunSummary[]>([]);

  useEffect(() => {
    mockApi.getRunsList().then(setRuns);
  }, []);

  return (
    <div>
      <Button onClick={createRun}>새 Run 생성</Button>

      <h2>최근 Run</h2>
      <ul>
        {runs.map(run => (
          <li key={run.run_id}>
            <Link href={`/app/run/${run.run_id}`}>
              {run.run_name} — {run.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Test
- **D4**: 딥링크 직접 입력 → Run 상세 정상 표시
- **Manual**: Dashboard → Run 상세 → Dashboard → 다른 Run 선택

---

## BP-06: localStorage는 항상 실패할 수 있다

### Rule
`localStorage.setItem/getItem`을 **try/catch로 감싸고**, 실패 시 기능을 degrade한다 (앱 크래시 금지).

### Anti-Pattern
```typescript
// ❌ BAD: 예외 처리 없음
const data = localStorage.getItem(key);
const parsed = JSON.parse(data); // Safari private → 크래시
```

### Why
프라이빗 모드/쿼터 초과/브라우저 정책에 따라 localStorage 접근이 예외를 던질 수 있다.

### Example
```typescript
// ✅ GOOD: 방어적 접근
function getItem<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn("[Storage] Failed to read:", error);
    return null; // 기능 degrade
  }
}

function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("[Storage] Failed to write:", error);
    // UI에 경고 표시 (예: "일부 기능이 제한됩니다")
    return false;
  }
}
```

### Test
- **D9**: Safari private mode → 크래시 없이 degrade
- **D10**: localStorage quota exceeded → 경고 표시

---

## BP-07: "문서 = 계약" (Claim–Evidence 매핑)

### Rule
README/Implementation Summary에 적는 모든 주장은 **증거(경로/스크린샷/로그/테스트)**를 붙인다.

### Anti-Pattern
```markdown
❌ BAD:
## 구현 완료
- Run 상태 폴링 구현 완료
- 에러 처리 구현 완료

(증거 없음 → 신뢰도 하락)
```

### Why
"구현됐다"라고 쓰고 실제 코드가 없으면 즉시 신뢰가 하락한다. 외부 심사위원은 문서를 계약으로 본다.

### Example
```markdown
✅ GOOD:
## 구현 완료
- **Run 상태 폴링 구현 완료**
  - 위치: `src/app/app/run/[runId]/page.tsx:44-60`
  - 테스트: D2 (SUCCEEDED 도달 → 폴링 중단) ✅ PASS
  - 증거: DevTools Network 스크린샷 (screenshot.png)

- **에러 처리 구현 완료**
  - 위치: `src/lib/storage.ts:27-38`
  - 테스트: D9 (Safari private mode) ✅ PASS
  - 증거: try/catch 추가 (commit 4352a88)
```

### Test
- **Manual**: README의 모든 주장에 대해 파일 경로/테스트 결과 확인
- **Audit**: 문서-코드 정합성 검증

---

## BP-08: Alert 금지, 에러 표면 통일

### Rule
`alert/confirm` 대신 **화면 내 error/toast로 통일**한다 (복구 버튼 포함).

### Anti-Pattern
```typescript
// ❌ BAD: alert 사용
if (error) {
  alert("다운로드 실패!");
}
// 모달 차단, 테스트 어려움, UX 저하
```

### Why
alert는 브라우저 모달을 차단하고, 자동 테스트가 어렵고, 모바일에서 UX가 나쁘다.

### Example
```typescript
// ✅ GOOD: Inline message
const [error, setError] = useState<string | null>(null);

return (
  <div>
    {error && (
      <div className="error-banner">
        {error}
        <button onClick={handleRetry}>재시도</button>
      </div>
    )}

    <button onClick={handleDownload}>다운로드</button>
  </div>
);

// Auto-dismiss (optional)
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }
}, [error]);
```

### Test
- **D7**: 느린 네트워크 → 에러 배너 + 재시도 버튼 확인
- **D8**: Offline → 에러 메시지 + 자동 복구 확인
- **Manual**: `grep -r "alert(" src/` → 0 results

---

## BP-09: Secure Mode는 UI가 아니라 데이터 계약으로 잠금

### Rule
Secure Mode ON 시 **URL은 state/manifest/run 어디에도 남지 않게 계약으로 고정**한다. UI 비활성화만으로는 부족하다.

### Anti-Pattern
```typescript
// ❌ BAD: UI만 비활성화
<input disabled={secureMode} />
// 개발자 도구로 우회 가능, 데이터에는 URL 잔존
```

### Why
UI 비활성화는 우회 가능하다. 데이터 계약으로 강제해야 심사위원 신뢰를 얻는다.

### Example
```typescript
// ✅ GOOD: 데이터 계약 + UI 동시 방어
async function createRun(inputs: WizardState): Promise<RunSummary> {
  const sanitized = { ...inputs };

  // Secure Mode 가드: URL 강제 초기화
  if (sanitized.secureMode && sanitized.sources.urls.length > 0) {
    console.warn("[Security] Secure Mode: URLs cleared");
    sanitized.sources.urls = [];
  }

  // Manifest 생성 시에도 재검증
  if (sanitized.secureMode) {
    assert(sanitized.sources.urls.length === 0, "Secure Mode violated");
  }

  // ...
}
```

### Test
- **D1-D2**: Secure Mode ON → Manifest 검증 (`manifest.inputs.urls` = [])
- **Manual**: 개발자 도구로 우회 시도 → 데이터 잔존 0건

---

## BP-10: DevTools로 "악조건"을 표준 테스트로 만들기

### Rule
**Offline/Slow3G/CPU throttle을 표준 회귀 테스트에 포함**한다. "정상 조건만" 테스트는 데모 킬러다.

### Anti-Pattern
```bash
# ❌ BAD: 정상 조건만 테스트
npm run dev
# (브라우저에서 클릭만 확인)
```

### Why
데모 시연 중 네트워크 지연/오프라인은 흔하다. 정상 조건만 테스트하면 실전에서 크래시한다.

### Example
```markdown
✅ GOOD: DevTools 테스트 체크리스트

## 필수 회귀 테스트
1. **Slow 3G** (Network 탭)
   - Run 생성 → QUEUED → RUNNING → SUCCEEDED 전이 확인
   - 재시도 버튼 동작 확인

2. **Offline** (Network 탭)
   - Offline ON → 에러 배너 표시 확인
   - Offline OFF → 자동 복구 확인

3. **CPU 6x slowdown** (Performance 탭)
   - Wizard 5단계 완주 → 10초 이내 확인

4. **Refresh (F5)**
   - RUNNING 중 F5 → 상태 정상 전이 확인

5. **Back/Forward 3x**
   - 폴링 중복 없음 (DevTools Network 확인)
```

### Test
- **D7**: Slow 3G → 모든 기능 동작 확인
- **D8**: Offline toggle → 자동 복구 확인
- **D1**: F5 → 상태 복구 확인

### Reference
- DevTools Network: https://developer.chrome.com/docs/devtools/network/reference

---

## 적용 체크리스트 (다음 프로젝트용)

### Phase 0: 설계
- [ ] BP-03: 상태머신 결정론적 설계 (created_at 기반)
- [ ] BP-05: Dashboard Run 리스트 기획 포함
- [ ] BP-09: Secure Mode 데이터 계약 정의

### Phase 1: 구현
- [ ] BP-01: JSON.stringify 사용 금지 (File/Date/Map 확인)
- [ ] BP-02: React state 불변성 보장 (새 객체/배열)
- [ ] BP-04: 폴링 4원칙 적용 (inFlight, terminal, backoff, bfcache)
- [ ] BP-06: localStorage try/catch 전역 적용
- [ ] BP-08: alert 제거 → inline messages

### Phase 2: 테스트
- [ ] BP-10: DevTools 악조건 테스트 (Slow 3G, Offline, F5, Back/Forward)
- [ ] BP-07: 문서-코드 정합성 검증 (Claim-Evidence 매핑)

### Phase 3: 데모 준비
- [ ] BP-05: Dashboard 재진입 경로 확인
- [ ] BP-09: Secure Mode Manifest 검증
- [ ] BP-10: 회귀 테스트 체크리스트 전부 통과

---

**Last Updated**: 2026-02-10
**Next**: DEC_LOG.md (주요 결정 기록)
