# Decision Log — DPP v0.1 Post-Audit Patches

**Purpose**: 설계 선택을 명시적으로 기록해 나중에 흔들리지 않게 잠금
**Session**: 2026-02-10 Audit Patches
**Format**: DEC-ID / Context / Decision / Consequence / Revisit Trigger

---

## DEC-AUDIT-01: created_at 기반 결정론적 상태 재계산

### Context
새로고침 시 타이머가 사라지면서 RUNNING 상태가 영구 고착되는 P0 문제 발생. Mock API의 상태 전이가 타이머만 의존하고 있었음.

### Decision
**created_at 기반 결정론적 상태 재계산**을 도입한다:
```typescript
function computeStatusFromElapsed(runId: string, elapsedMs: number): RunStatus {
  if (elapsedMs < 2000) return "QUEUED";

  const seed = runId.charCodeAt(runId.length - 1) % 5000;
  const transitionTime = 2000 + 5000 + seed;

  if (elapsedMs < transitionTime) return "RUNNING";

  const successSeed = runId.charCodeAt(0) % 10;
  return successSeed < 8 ? "SUCCEEDED" : "FAILED";
}
```

getRun() 호출 시마다 `Date.now() - created_at`로 경과 시간을 계산하고, 결정론적으로 상태를 재계산한다.

### Consequence
- ✅ **장점**: 새로고침/다중탭/딥링크 모두 복구 가능
- ✅ **장점**: 브라우저 History API/bfcache와 무관하게 일관된 상태
- ⚠️ **단점**: 타이머와 재계산 로직이 중복 유지 (DRY 위반)
- ⚠️ **단점**: runId 기반 시드로 성공률 고정 (같은 runId는 항상 같은 결과)

### Revisit Trigger
- v0.2 백엔드 연동 시: 서버 상태가 Single Source of Truth가 되면 이 로직 제거
- runId 시드 문제 발견 시: UUID 기반 랜덤 시드로 변경

---

## DEC-AUDIT-02: JSON deepClone vs structuredClone

### Context
P0-2 문제로 React state mutation을 방지하기 위해 deepClone이 필요했음. `JSON.parse(JSON.stringify())`는 File/Date 손실 위험이 있지만, `structuredClone`은 브라우저 지원 범위 확인이 필요했음.

### Decision
**JSON deepClone을 사용한다**:
```typescript
const sanitizedInputs: WizardState = JSON.parse(JSON.stringify(inputs));
```

단, File 객체는 복사하지 않고 **메타 정보만 Manifest에 저장**한다 (파일 업로드는 v0.2 백엔드 연동 범위).

### Consequence
- ✅ **장점**: 모든 브라우저에서 즉시 동작 (IE 포함)
- ✅ **장점**: v0.1 Mock API 범위에서는 File 실제 업로드 없음 (메타만 저장)
- ⚠️ **단점**: 나중에 File 실제 업로드 시 JSON deepClone 제거 필요
- ⚠️ **단점**: Date/Map 사용 시 별도 처리 필요

### Revisit Trigger
- v0.2 파일 업로드 구현 시: `structuredClone` 또는 타입별 명시적 복사로 교체
- Date/Map 사용 시: BP-01 참조하여 명시적 복사

---

## DEC-AUDIT-03: Polling inFlight guard 패턴

### Context
P1-2 문제로 Back/Forward 반복 시 폴링 interval이 중복 생성되어 동시 다발 요청이 발생했음.

### Decision
**inFlight guard 패턴**을 도입한다:
```typescript
let isFetching = false;

const pollRun = async () => {
  if (isFetching) return; // 중복 방지

  isFetching = true;
  try {
    const run = await mockApi.getRun(runId);
    // ...
  } finally {
    isFetching = false; // 반드시 해제
  }
};
```

### Consequence
- ✅ **장점**: 동시 요청 완전 방지
- ✅ **장점**: 간단한 패턴 (전역 변수 1개)
- ⚠️ **단점**: 요청 실패 시 다음 폴링까지 대기 (즉시 재시도 불가)
- ⚠️ **단점**: 컴포넌트 언마운트 시 isFetching 초기화 필요 (메모리 누수 방지)

### Revisit Trigger
- 즉시 재시도가 필요한 경우: Exponential backoff + 재시도 큐 패턴으로 교체
- v0.2 WebSocket 연동 시: 폴링 완전 제거

---

## DEC-AUDIT-04: localStorage 예외 처리 전략

### Context
D9/D10 문제로 Safari private mode와 quota exceeded 시 localStorage가 예외를 던지면서 앱이 크래시했음.

### Decision
**모든 localStorage 접근을 try/catch로 방어**하고, 실패 시 **기능 degrade**한다:
```typescript
try {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  return JSON.parse(stored);
} catch (error) {
  console.warn("[Storage] Failed:", error);
  return null; // degrade: 데이터 없음으로 처리
}
```

크래시 대신 경고 로그만 출력하고, 앱은 계속 동작하게 한다.

### Consequence
- ✅ **장점**: 어떤 환경에서도 크래시 없음 (Safari, 시크릿, 모바일)
- ✅ **장점**: 사용자에게 명시적 에러 없이 degrade (UX 개선)
- ⚠️ **단점**: 데이터 손실 가능성 (사용자는 인지 못함)
- ⚠️ **단점**: 디버깅 어려움 (경고만 출력)

### Revisit Trigger
- 데이터 손실이 치명적인 경우: UI에 경고 배너 표시 ("일부 기능이 제한됩니다")
- v0.2 백엔드 연동 시: 서버 저장으로 전환 (localStorage는 캐시로만 사용)

---

## DEC-AUDIT-05: alert 제거 → inline messages

### Context
P1-3 문제로 alert()가 브라우저 모달을 차단하고, 테스트가 어렵고, 모바일 UX가 나빴음.

### Decision
**모든 alert를 inline messages (3s auto-dismiss)로 교체**한다:
```typescript
const [message, setMessage] = useState<string | null>(null);

// alert("다운로드 완료") 대신:
setMessage("다운로드 준비: Pack.pdf");
setTimeout(() => setMessage(null), 3000);

return (
  <div>
    {message && <div className="success-banner">{message}</div>}
  </div>
);
```

### Consequence
- ✅ **장점**: 브라우저 모달 차단 없음
- ✅ **장점**: 자동 테스트 가능 (E2E)
- ✅ **장점**: 모바일 UX 개선
- ⚠️ **단점**: 사용자가 메시지를 놓칠 수 있음 (3s 자동 사라짐)
- ⚠️ **단점**: 중요한 경고는 auto-dismiss 부적합 (수동 닫기 필요)

### Revisit Trigger
- 중요한 경고 (예: 데이터 손실 경고) 시: auto-dismiss 제거, 수동 닫기 버튼 추가
- Toast 라이브러리 도입 시: react-hot-toast 같은 라이브러리로 교체

---

## DEC-AUDIT-06: Dashboard Run 리스트 v0.2 연기

### Context
P0-3 문제로 Dashboard에 Run 리스트가 없어서 재진입 경로가 없었음. "새 Run 생성" 버튼만 있음.

### Decision
**v0.1은 "새 Run 생성" 버튼만 유지**하고, Run 리스트는 **v0.2 백엔드 연동 시 구현**한다.

이유:
1. Mock API의 LocalStorage는 다른 브라우저/기기에서 공유 안 됨 (동기화 없음)
2. 외부 심사위원 데모는 "새 Run 생성 → 결과 확인" 플로우만 시연
3. 브라우저 뒤로가기로 충분히 재진입 가능

### Consequence
- ✅ **장점**: v0.1 범위 축소 (데모 준비 시간 단축)
- ✅ **장점**: 백엔드 연동 시 서버 데이터로 Run 리스트 표시 (더 정확)
- ⚠️ **단점**: 히스토리 손실 시 재진입 불가 (브라우저 캐시 삭제 등)
- ⚠️ **단점**: 다중 Run 관리 불가 (데모 시연 제약)

### Revisit Trigger
- v0.2 백엔드 연동: storage.getRunsList() 기반 Dashboard 구현
- 다중 Run 시연 필요 시: 임시로 Mock API Run 리스트 표시

---

## DEC-AUDIT-07: bfcache 부분 해결 (visibilitychange 미적용)

### Context
D5 문제로 bfcache 복원 시 타이머가 중복 생성되어 폴링이 2배, 3배로 증가했음.

### Decision
**scheduledRuns Set으로 타이머 중복 방지**만 적용하고, **visibilitychange 완전 방어는 v0.2 연기**한다:
```typescript
const scheduledRuns = new Set<string>();

function scheduleStatusTransition(runId: string): void {
  if (scheduledRuns.has(runId)) return; // 중복 방지
  scheduledRuns.add(runId);
  // ...
}
```

visibilitychange 이벤트로 타이머 정리하는 것은 복잡도가 높아서 v0.1 범위 제외.

### Consequence
- ✅ **장점**: 대부분의 중복 방지 (같은 runId 재스케줄 차단)
- ✅ **장점**: 간단한 패턴 (Set 1개 추가)
- ⚠️ **단점**: 탭 전환 시 백그라운드 타이머 계속 동작 (배터리 소모)
- ⚠️ **단점**: visibilitychange 없이는 완전 방어 불가

### Revisit Trigger
- 배터리 소모 문제 제기 시: visibilitychange로 타이머 pause/resume
- v0.2 WebSocket 연동 시: 타이머 완전 제거

---

## 요약: 핵심 설계 결정 3가지

1. **결정론적 복구 우선** (DEC-AUDIT-01)
   - 타이머는 보조, created_at 기반 재계산이 메인

2. **크래시 방지 최우선** (DEC-AUDIT-04, DEC-AUDIT-05)
   - localStorage 예외, alert 제거 → 데모 안정성 극대화

3. **범위 축소 (v0.1 → v0.2)** (DEC-AUDIT-06, DEC-AUDIT-07)
   - Dashboard Run 리스트, bfcache 완전 방어는 백엔드 연동 후

---

**Last Updated**: 2026-02-10
**Next**: 최종 커밋 및 세션 마무리
