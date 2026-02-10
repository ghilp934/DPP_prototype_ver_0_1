# Decision Pack Platform — Frontend Prototype v0.1

**Status**: 🚀 Production-Ready (P0/P1 Audit Patches Applied)

AI 기반 공모사업 제안서 작성 지원 플랫폼의 프론트엔드 프로토타입입니다. Next.js 16 + React 19 + TypeScript 기반으로 구현되었으며, Mock API를 통해 전체 사용자 플로우를 시연할 수 있습니다.

---

## 🎯 프로젝트 목적

**Decision Pack Platform v0.1**은 다음을 목표로 합니다:

1. **UI/UX 검증**: 5단계 Wizard 기반 제안서 작성 플로우 검증
2. **상태 관리**: Run 생성 → 처리 → 결과 다운로드 플로우 구현
3. **데모 준비**: 외부 심사위원/이해관계자 대상 시연 가능한 완성도
4. **백엔드 연동 준비**: API 인터페이스 및 데이터 계약 정의

---

## 🚀 빠른 시작

### 필수 요구사항
- **Node.js**: 24.x LTS
- **npm**: 11.x 이상

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작
npm run dev
```

개발 서버가 시작되면 브라우저에서 http://localhost:3000 으로 접속하세요.

### 빌드 및 검증

```bash
# TypeScript 타입 검증
npm run typecheck

# ESLint 코드 품질 검증
npm run lint

# 프로덕션 빌드
npm run build
```

---

## 🎬 데모 시나리오 (추천 플로우)

### 시나리오 1: DP-Grant (P1 프로필)
**목표**: 정부 지원사업 신청서 작성

1. **Dashboard** (`/app`) 에서 **"새 Run 생성"** 클릭
2. **Step 0**: SKU = `DP_GRANT`, Profile = `P1` 선택
3. **Step 1**: 프로젝트명 입력 (예: "2026 스마트팜 지원사업")
4. **Step 2**: 파일 업로드 또는 URL 추가
5. **Step 3**: 출력 형식 선택 (PDF, DOCX, PPTX)
6. **Step 4**: 입력 확인 + AI 고지 동의 → **"Run 생성"**
7. **Run 상세** (`/app/run/:runId`): 상태 폴링 (QUEUED → RUNNING → SUCCEEDED)
8. **결과 다운로드**: Pack.pdf, Manifest.json 다운로드
9. **Manifest 보기** (`/app/run/:runId/log`): 실행 로그 확인

### 시나리오 2: DP-RFP (Secure Mode)
**목표**: 입찰 제안서 작성 (URL 수집 비활성)

1. Dashboard에서 **"새 Run 생성"**
2. **Step 0**: SKU = `DP_RFP`, Profile = `P2`, **Secure Mode ON**
3. **Step 2**: URL 입력 필드 비활성화 확인 (LOCK-RFP-SEC-01)
4. 나머지 플로우는 시나리오 1과 동일

### 시나리오 3: FAILED Run (Discard Knowledge)
**목표**: 실패 처리 및 지식 저장

1. Run 생성 후 FAILED 상태 도달 대기 (20% 확률)
2. **"Discard Knowledge 카드 생성"** 클릭
3. LocalStorage 저장 확인 (새로고침 후에도 유지)

---

## 🗂️ 핵심 경로 (Routes)

| 경로 | 설명 | 타입 |
|------|------|------|
| `/` | Landing page | Static |
| `/app` | Dashboard (Run 리스트) | Static |
| `/app/new` | Wizard (5단계 Run 생성) | Static |
| `/app/run/:runId` | Run 상세 (상태 폴링 + 다운로드) | Dynamic |
| `/app/run/:runId/log` | Manifest Viewer (JSON + 요약) | Dynamic |
| `/app/pay/:runId` | 결제 Stub (v0.1 미구현) | Dynamic |
| `/policies` | AI 고지 + 환불 정책 | Static |

---

## 🛠️ 기술 스택

- **Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Context + Reducer
- **Persistence**: LocalStorage (Mock API)
- **Linting**: ESLint + Prettier
- **Package Manager**: npm 11.x

---

## 📦 Mock Persistence 주의사항

**v0.1은 Mock API 기반**으로, 실제 백엔드 없이 LocalStorage를 사용합니다:

### ⚠️ 제약사항
1. **데이터 영속성**: 브라우저 LocalStorage에만 저장
   - 시크릿/프라이빗 모드: 탭 종료 시 데이터 삭제
   - 브라우저 캐시 삭제: 모든 Run 데이터 손실
   - 다른 브라우저/기기: 데이터 공유 불가

2. **용량 제한**: LocalStorage 약 5~10MB
   - 과도한 Run 생성 시 `QuotaExceededError` 가능
   - LRU 방식으로 최근 50개 Run만 유지

3. **파일 업로드**: File 객체는 저장 안 됨
   - 파일 메타 정보만 `run.manifest.inputs.files`에 저장
   - 실제 파일 내용은 메모리에만 존재 (새로고침 시 사라짐)

4. **네트워크**: 실제 HTTP 요청 없음
   - 모든 API 호출은 LocalStorage 읽기/쓰기
   - 상태 전이는 in-memory 타이머 기반

### ✅ 안정성 보장 (Audit Patches 적용)
- **P0-1**: 새로고침 시 상태 고착 방지 (created_at 기반 복구)
- **P0-2**: React state 불변성 보장 (deepClone)
- **D9/D10**: Safari/quota 예외 처리 (try/catch)
- **P1-2**: 폴링 중복 방지 (inFlight guard)
- **D7/D8**: 네트워크 에러 복구 (재시도 버튼)

---

## 🧪 테스트 가이드

### 브라우저 테스트 (권장)
```bash
# 개발 서버 시작
npm run dev
```

**필수 시나리오:**
1. **새로고침 복구**: RUNNING 중 F5 → 상태 정상 전이 확인
2. **터미널 폴링 중단**: SUCCEEDED/FAILED → DevTools Network에서 요청 중단 확인
3. **다중탭 동기화**: 같은 Run을 2개 탭에서 열기 → 일관된 상태 확인
4. **Offline 복구**: DevTools Offline ON/OFF → 에러 + 재시도 버튼 확인

### 코드 품질 검증
```bash
# 전체 검증 (권장)
npm run lint && npm run typecheck && npm run build

# 개별 실행
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run build       # Next.js 프로덕션 빌드
```

---

## 📚 주요 문서

- **`PROJECT_ROADMAP_v0_1.md`**: Phase 0~5 구현 로드맵
- **`IMPLEMENTATION_SUMMARY.md`**: 구현 완료 내역 + Audit Patches
- **`Decision_Pack_Platform_FE_Prototype_v0_1_Spec.md`**: 기능 명세서
- **`DPP_Demo_Audit_P0_Repro_Checklist_v0_2.md`**: 브라우저 행동 테스트 시나리오
- **`DPP_Strict_Audit_Patch_Checklist_v0_1_0.md`**: 구조적 리스크 체크리스트

---

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── app/               # Dashboard + Run Flow
│   ├── policies/          # Policy pages
│   └── layout.tsx         # Root layout
├── components/
│   └── shared/            # 공통 컴포넌트 (Header, Footer)
├── features/
│   └── wizard/            # Wizard Context + Steps (W0~W4)
├── lib/
│   ├── mockApi.ts         # Mock API (LocalStorage)
│   ├── storage.ts         # LocalStorage wrapper
│   ├── telemetry.ts       # Telemetry event logging
│   └── validators.ts      # Form validators
└── contracts/
    ├── run.ts             # Run types
    ├── manifest.ts        # Manifest types
    ├── constants.ts       # SKU, Profile, RunStatus
    └── errorCodes.ts      # Error code types
```

---

## 🐛 알려진 이슈

### Windows 환경 제약
- **Static Export 불가**: `output: 'export'` 사용 시 EISDIR 오류
- **해결**: `next dev` 또는 `next start` 사용 (v0.2에서 해결 예정)

### v0.1 범위 제외
- **실제 파일 업로드**: 백엔드 연동 필요
- **결제 기능**: Stub만 제공 (`/app/pay/:runId`)
- **Dashboard Run 리스트**: 현재는 "새 Run 생성" 버튼만 제공 (v0.2 계획)

---

## 🚧 다음 단계 (v0.2 계획)

1. **백엔드 연동**
   - 실제 REST API 통합
   - 파일 업로드 (multipart/form-data)
   - WebSocket 기반 실시간 상태 업데이트

2. **Dashboard 개선**
   - Run 리스트 + 검색/필터
   - 상태별 그룹핑
   - 삭제/재시도 기능

3. **결제 통합**
   - PG 연동 (토스페이먼츠/아임포트)
   - 환불 처리 플로우

4. **프로덕션 배포**
   - Vercel/Netlify 배포
   - CI/CD 파이프라인

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 참조

---

## 👥 기여자

**Owner**: Claude Code (AI Assistant)
**Human Collaborator**: ghilp934

---

## 🔗 관련 링크

- **GitHub Repository**: https://github.com/ghilp934/DPP_prototype_ver_0_1
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev

---

**마지막 업데이트**: 2026-02-10
**버전**: v0.1 + Post-Audit Patches (P0/P1)
