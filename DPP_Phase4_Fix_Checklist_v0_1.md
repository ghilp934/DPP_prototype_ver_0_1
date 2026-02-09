# DPP Prototype v0.1 → Phase 4 준비: 수정 지시서(체크리스트) v0.1
(대상: Claude Code / 목적: Phase 4(Log & Manifest) 진입 전 P0 이슈 정리 + 결정론 잠금)

## 0) RUN MODE (스펙 잠금)
- 목표: “Secure Mode 일관성 / Run 폴링 안정성 / LocalStorage 안전 저장 / Route params 타입 잠금” 4가지만 반영
- 비목표(금지): 디자인 리뉴얼, 큰 리팩터링(폴더 구조 이동), 기능 추가(백엔드 연동/실제 다운로드), UI 문구 전면 개편
- 원칙: 변경은 **파일 단위 최소**, “추측” 금지, 각 항목별 Done Criteria 충족 시 종료

---

## 1) P0 — Secure Mode 일관성 잠금 (URL 잔존 방지)
### 수정 대상
- `src/features/wizard/WizardContext.tsx`
- (옵션 가드) `src/lib/mockApi.ts` (createRun 입력 검증)

### 작업
1. `wizardReducer`의 `case "SET_SECURE_MODE"`를 다음 정책으로 고정
   - `secureMode=true`로 전환되는 순간, 기존에 입력된 `sources.urls`를 강제 초기화(`[]`)
   - UX: W2에서 이미 Secure Mode 안내 박스가 있으니, “URL이 제거되었음” 정도의 한 줄 안내만 추가(과도한 UI 변경 금지)

2. (옵션, 방어적) `mockApi.createRun(inputs)` 시작부에 가드 추가
   - 조건: `inputs.secureMode === true && inputs.sources.urls.length > 0`
   - 처리: (A) 강제 초기화 후 진행 또는 (B) 즉시 throw (선호: A, 프로토타입 UX 안정)

### Done Criteria
- Secure Mode ON → URL 입력 UI가 숨겨지는 것 + **state에 URL 데이터가 남지 않음**
- `mockApi.createRun` 결과(run.manifest.inputs.urls)가 Secure Mode ON일 때 항상 빈 배열(또는 생성되지 않음)

---

## 2) P0 — Run Detail 폴링 로직 “터미널 상태에서 즉시 종료”
### 수정 대상
- `src/app/app/run/[runId]/page.tsx`

### 작업
1. interval 타입을 브라우저/Node 혼용에 안전하게 변경
   - `let intervalId: ReturnType<typeof setInterval> | null = null;`
2. 폴링 시작 조건을 “초기 fetch 결과가 터미널이 아닐 때만”으로 변경
   - 첫 `fetchRun()` 완료 후, status가 `QUEUED|RUNNING`일 때만 `setInterval` 시작
   - `SUCCEEDED|FAILED`이면 interval을 **설정하지 않음**
3. 폴링 중에도 터미널 상태로 전환되면 즉시 `clearInterval`
4. Cleanup은 현재처럼 유지(언마운트 시 clear)

### Done Criteria
- 첫 로드가 `SUCCEEDED/FAILED`인 Run은 **추가 폴링이 발생하지 않음**
- `ENV.POLL_INTERVAL` 기준으로 폴링이 1개 interval만 유지되고 중복 생성되지 않음

---

## 3) P0 — LocalStorage 저장 안정화 (File 직렬화 제거)
### 수정 대상
- `src/lib/storage.ts`

### 작업
1. `saveRun(run: RunDetail)` 저장 직전, `run.inputs.sources.files`를 직렬화 안전 형태로 변환
   - 최소 변경 권장안: 저장용 객체(`persistableRun`)를 만들고 `persistableRun.inputs.sources.files = []` 로 강제
   - 이유: `File` 객체는 JSON 직렬화/복원 시 안정성이 낮고, Phase 4에서 Log/Manifest 텔레메트리 붙일 때 리스크가 커짐
2. 주석으로 “Run.inputs는 WizardState 전체를 저장하지만, **File 객체는 영속 저장하지 않는다**”를 명시

### Done Criteria
- `createRun → storage.saveRun → getRun` 흐름에서 JSON stringify/parse 에러가 0
- Run 상세 화면에서 최소한 `run.inputs` 접근으로 런타임 오류가 발생하지 않음
- (권장) 파일 메타 정보는 `run.manifest.inputs.files[]`로 확인 가능(이미 구현됨)

---

## 4) P1 — Next.js params/searchParams 타입 잠금(공식 패턴으로 통일)
### 수정 대상
- 서버 컴포넌트 페이지:
  - `src/app/app/pay/[runId]/page.tsx`
  - `src/app/app/run/[runId]/log/page.tsx`
- 클라이언트 컴포넌트:
  - `src/app/app/run/[runId]/page.tsx` (useParams)

### 작업
1. 서버 페이지는 Next 공식 `PageProps` 헬퍼로 통일(라우트 리터럴 사용)
   - 예: `export default async function Page(props: PageProps<'/app/pay/[runId]'>) { const { runId } = await props.params }`
2. 클라이언트 페이지는 `useParams`를 제네릭으로 타입 고정
   - 예: `const { runId } = useParams<{ runId: string }>();`

### Done Criteria
- `npm run typecheck`에서 params 관련 타입 에러 0
- “params/searchParams는 Promise” 패턴이 코드베이스에서 일관됨(혼용 최소화)

---

## 5) (옵션) Phase 4 선행: Discard Knowledge 저장 연결(Stub → 실제 저장)
### 수정 대상
- `src/app/app/run/[runId]/page.tsx`

### 작업
- `handleCreateDiscardCard()`에서 `storage.saveDiscardKnowledge(runId, knowledge)` 호출하도록 연결
- Run detail 또는 `/log` 페이지에서 저장된 Discard 카드 목록을 표시하는 것은 Phase 4에서 진행(지금은 저장만)

### Done Criteria
- Discard 카드 생성 시 localStorage에 저장되고, 새로고침 후에도 유지됨

---

## 6) 최종 검증 커맨드(필수)
- `npm run lint`
- `npm run typecheck`
- `npm run build`

---

## 참고(공식 문서)
아래 URL은 “params/searchParams Promise + PageProps 헬퍼 + useParams 제네릭” 규칙 확인용

```
https://nextjs.org/docs/app/api-reference/file-conventions/page
https://nextjs.org/docs/app/api-reference/functions/use-params
```
