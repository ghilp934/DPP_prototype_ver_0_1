# DPP Frontend Prototype v0.1 — “데모 시연 심사위원 행동” 기반 P0 재현 테스트 체크리스트 v0.2
(대상: Claude Code / QA 담당 / 목적: 데모 시연 중 ‘현실 행동’(새로고침/뒤로가기/다중탭/느린 네트워크/시크릿 모드 등)에서 터지는 P0를 **강제로** 드러내기)

## 0) 운영 규칙(빡빡 모드)
- **HARD FAIL(즉시 중단)**: (a) 흰 화면/Unhandled error (b) 무한 스피너(>10초) (c) Run 상태가 영구적으로 QUEUED/RUNNING에 고착 (d) Secure Mode인데 URL이 Manifest/Run에 남음
- **관측(필수)**: DevTools Console + Application(localStorage) + Network 탭을 켜고 진행
- **사전 초기화**: localStorage의 `dpp_*` 키를 모두 삭제하고 1회 “새 Run 생성 → Run 상세 진입”으로 워밍업

---

## 1) 테스트 준비(DevTools 세팅)
### 1-1. 네트워크 시뮬레이션(느린/오프라인)
- Network 탭에서 **Offline / Slow 3G / Custom throttling**을 사용해 네트워크 품질을 강제로 낮춘다.
- Custom profile(다운/업/latency) 생성 후 적용 가능.  
  (근거: Chrome DevTools 네트워크 throttling 프로필/Offline 시뮬레이션 지원)

### 1-2. Back/Forward(bfcache) 영향 고려
- 뒤로/앞으로 이동 시 브라우저는 **bfcache**로 “페이지 스냅샷 복원”을 할 수 있다.
- 따라서 “언마운트/리마운트”가 아닌 “복원” 시에도 폴링/이벤트가 중복되지 않게 확인한다.  
  (근거: bfcache는 뒤로/앞으로 이동을 즉시 복원하는 브라우저 최적화이며, pagehide/pageshow 같은 lifecycle 이벤트가 연관됨)

### 1-3. 저장소(localStorage) 변동/예외
- localStorage는 브라우저/모드에 따라 용량/예외가 달라지고, 시크릿/프라이빗은 탭 종료 시 데이터가 사라진다.
- 용량 초과 시 `QuotaExceededError`가 날 수 있으므로 try/catch 및 UX 에러 처리 여부를 본다.  

---

## 2) “심사위원이 보통 하는 행동” 10개 — P0 재현 테스트 케이스
아래 각 케이스는 **Steps / Expected / Fail Signal / Fix Hint**로 구성.

---

### D1. RUNNING 중 F5(새로고침) — 상태 고착(stuck) 유발
Steps
1) 새 Run 생성 → Run 상세 진입 → 상태가 QUEUED→RUNNING으로 바뀐 직후(F5)
2) 새로고침 후 20초 관찰

Expected
- 폴링이 정상 재개되고, RUNNING이 **최종(SUCCEEDED/FAILED)로 반드시** 전이

Fail Signal (HARD FAIL)
- RUNNING/QUEUED가 20초 이상 유지되며 더 이상 변하지 않음(= 타이머/상태머신 유실)

Fix Hint
- In-memory 타이머 의존 제거(생성 시각 기반 “결정론적 상태 재계산”) 또는 새로고침 후 상태머신 재스케줄(hydration)

---

### D2. 터미널 상태(SUCCEEDED/FAILED)에서 F5 — 폴링/중복 요청 방지
Steps
1) Run이 SUCCEEDED/FAILED가 된 뒤 F5
2) Network 탭에서 요청이 반복되는지 확인(10초)

Expected
- 터미널 상태에서는 폴링이 “0회” 또는 “초기 1회 fetch 후 종료”

Fail Signal
- 터미널 상태인데 계속 fetch(= setInterval이 무조건 생성되거나 clear가 누락)

Fix Hint
- “초기 fetch 결과가 터미널이면 interval 자체를 만들지 않기” + pageshow(bfcache 복원)에서도 중복 방지

---

### D3. 뒤로/앞으로 가기(Back/Forward) — bfcache 복원 시 폴링 중복 방지
Steps
1) Run 상세에서 Dashboard로 이동 → 브라우저 Back으로 Run 상세 복귀
2) 다시 Forward → 다시 Back을 3회 반복
3) Console/Network에서 폴링이 1개만 유지되는지 확인

Expected
- 복원/재진입 후에도 “폴링 interval 1개”만 유지되고, 중복 타이머가 누적되지 않음

Fail Signal
- Back/Forward 반복할수록 fetch 빈도가 증가(= interval 누적)

Fix Hint
- useEffect cleanup 보장 + pageshow/pagehide 고려 + isMounted/inFlight 가드

---

### D4. “직접 URL 붙여넣기” 딥링크 — cold start에서 Run 복원
Steps
1) 기존에 생성된 runId를 복사
2) 새 탭(완전 새로)에서 `/app/run/{runId}`를 직접 입력해 진입

Expected
- “Run을 찾을 수 없습니다”가 아니라, localStorage 기반으로 Run 상세가 복원됨
- status가 터미널이면 즉시 렌더, 진행 중이면 폴링 정상

Fail Signal
- 런타임 에러 / 빈 화면 / 무한 로딩 / Run null 처리 미흡

Fix Hint
- storage.getRun → 없으면 친절한 “복구 안내” + 대시보드로 이동 버튼

---

### D5. 다중탭(같은 runId) 동시 열기 — 레이스/데이터 훼손 방지
Steps
1) 같은 runId를 탭 A/B에서 동시에 열기
2) 탭 A에서 3회 새로고침, 탭 B에서 Back/Forward 3회
3) 최종 상태/manifest가 동일하게 보이는지 확인

Expected
- 마지막 write wins라도 “데이터가 깨지지 않음”
- 터미널 상태/manifest는 최종적으로 동일

Fail Signal (HARD FAIL)
- JSON parse 에러, run.inputs가 null로 깨짐, status가 왔다갔다(플리커)

Fix Hint
- storage write는 try/catch + schema-guard(최소 필드 검증) + inFlight fetch 디듑

---

### D6. “연타/더블클릭” — Run 중복 생성 방지
Steps
1) Wizard 마지막 단계에서 “Run 생성” 버튼을 5회 연타(또는 Enter 연속)
2) 대시보드/리스트에서 Run이 중복 생성되는지 확인

Expected
- 1개만 생성되거나(권장), 중복 생성되더라도 UI에 명확히 표시되고 충돌 없이 목록 유지

Fail Signal
- 버튼 연타로 run 생성 요청이 다중 발생 + 저장/화면 상태가 꼬임

Fix Hint
- submit 중 disable + request_id 기반 idempotency(프론트 레벨)

---

### D7. “느린 네트워크”에서 생성/폴링 — UX/에러 복구
Steps
1) DevTools Network에서 Slow 3G(또는 Custom latency 800ms+) 적용
2) Run 생성 → 상세 진입 → 폴링 3회 이상 관찰
3) 로딩/에러 문구가 합리적인지 확인

Expected
- 느려도 “무한 스피너” 없이 상태가 갱신
- 에러 발생 시 “재시도 가능” UX(버튼/안내) 또는 최소한 error state 표시

Fail Signal
- 타임아웃/에러 후 상태가 멈추거나, loading이 영구 지속

Fix Hint
- fetch 타임아웃 + backoff + retry UI(최소 1회 수동 재시도)

---

### D8. Offline 토글(중간에 끊김) — 폴링 에러 핸들링 + 복구
Steps
1) RUNNING 중 DevTools Offline ON
2) 10초 유지 → Offline OFF
3) 상태가 다시 업데이트되는지 확인

Expected
- Offline 동안 에러 표시(또는 조용한 실패)하더라도, Online 복귀 시 폴링이 재개됨

Fail Signal
- Offline 한 번 이후 영구 실패/스피너 고착

Fix Hint
- 네트워크 에러를 “terminal 처리”하지 말고, inFlight 리셋 + 다음 tick에서 재시도

---

### D9. 시크릿/프라이빗 모드 — 저장소 초기화/예외 처리
Steps
1) 시크릿 창에서 Run 1개 생성
2) 시크릿 탭을 모두 닫고 다시 시크릿으로 진입
3) (가능하면 Safari private도) 실행해 setItem 예외 여부 확인

Expected
- 시크릿 종료 후 데이터가 사라져도 앱이 **정상 안내/정상 동작**
- setItem 실패 시에도 앱이 죽지 않음(try/catch + 사용자 메시지)

Fail Signal (HARD FAIL)
- localStorage setItem에서 예외 발생 후 앱 전체 크래시
- “window is undefined” 류 SSR 크래시

Fix Hint
- 모든 storage setItem을 try/catch로 감싸고, 저장 실패 시 degrade(목록 저장 생략 등)

---

### D10. Storage quota/eviction 압박 — QuotaExceededError 방어
Steps
1) Run을 연속 생성해 localStorage에 데이터를 누적(최소 60회 이상 또는 run payload를 크게)
2) 저장 실패 시 콘솔/UX 반응 확인

Expected
- QuotaExceededError가 나더라도 앱이 죽지 않고, 저장 실패를 로그로 남기며 계속 사용 가능(최소 degrade)

Fail Signal (HARD FAIL)
- 저장 예외가 렌더를 깨뜨리거나, 이후 모든 기능이 멈춤

Fix Hint
- LRU 유지(현재 runs list 50개 제한은 좋음) + run detail 저장 실패 시 graceful handling(메모리 전용 fallback)

---

## 3) 기록해야 할 “증거(Artifacts)” 체크
- Console 스크린샷: `[RunDetail]`, `[Storage]` 로그가 보이게
- Application 탭: localStorage 키 존재 확인  
  - `dpp_runs`  
  - `dpp_run_{runId}`  
  - `dpp_discard_knowledge`
- Network 탭: 폴링 중복(요청 frequency 증가) 여부, Offline/Slow3G 시 행태

---

## 4) 합격 기준(데모 출고 게이트)
- D1~D3 중 하나라도 HARD FAIL이면 **데모 출고 금지**
- D7~D10은 “에러 메시지/복구 가능”이면 통과(단, 크래시는 무조건 FAIL)

---

## 참고(근거 문서: QA 세팅/브라우저 행태 이해용)
- Chrome DevTools: Offline/네트워크 throttling 프로필
- bfcache: Back/Forward 즉시 복원 + pagehide/pageshow 연관
- localStorage: 프라이빗에서 탭 종료 시 삭제 / 용량 제한 및 QuotaExceededError 가능
- React: state 객체 직접 mutation 금지(불변성)
