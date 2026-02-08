# Phase 0 Kickoff Guide — 권장 작업 시퀀스 및 프롬프트

**목표**: Next.js 16.x + React 19.x 프로젝트 초기화 완료
**예상 소요**: 30분
**통과 기준**: `npm run dev` → `localhost:3000` 정상 동작 + Lint/Typecheck 0 errors

---

## 🎯 Phase 0 시작 전 협업 프로토콜

### **전체 목표 재확인**
```markdown
프로젝트: Decision Pack Platform Prototype v0.1
최종 DoD: Wizard → Run 생성 → 상태 전환 → 다운로드 → Manifest → Smoke Test 5종 통과
현재 Phase: Phase 0 (프로젝트 초기화)
```

### **검증 책임 분담**
```markdown
사용자 담당:
- 브라우저에서 localhost:3000 접속 확인
- 화면 정상 동작 확인
- 최종 승인 (Phase 완료)

Claude 담당:
- 코드 작성
- Lint/Typecheck/Build 검증
- 에러 수정
- 진행 상황 보고
```

### **포기 기준**
```markdown
동일 에러 2회 반복 시: 즉시 대안 제시 (DEC 작성)
환경 문제 (Node 버전 등): 1회 시도 후 수동 설정 가이드 제공
```

---

## 📋 권장 작업 시퀀스

### **Step 0: 사전 준비 (사용자)**
작업 디렉토리로 이동:
```bash
cd "D:\Claude 프로젝트\dpp_v2_fe_layout"
```

Node 버전 확인:
```bash
node -v   # v24.x 이상이어야 함
npm -v
```

**예상 결과**:
- Node: v24.0.0 이상
- npm: v10.0.0 이상

**문제 발생 시**:
- Node 버전이 낮으면 → nvm으로 업그레이드 권장

---

### **Step 1: Next.js 프로젝트 생성 (Claude)**

#### **권장 프롬프트 (사용자 → Claude)**
```markdown
Phase 0 시작해줘. MT-0.1부터 순서대로 진행하고, 각 Task 완료 후 간단히 보고해줘.

MT-0.1 (필수): Next.js 프로젝트 생성
- 핵심: App Router + TypeScript + Tailwind CSS
- 검증: package.json 확인 + npm run dev 실행
- 포기 기준: 설치 실패 2회 → Node 버전 확인 요청

참고: CLAUDE.md, PROJECT_ROADMAP_v0_1.md
```

#### **Claude 작업**
1. `npx create-next-app` 실행 (옵션: TypeScript, Tailwind, App Router, src-dir)
2. `package.json` 확인 (next@^16.0.0, react@^19.0.0)
3. `npm run dev` 실행 → 정상 동작 확인
4. 보고: "MT-0.1 완료. Next.js 16.x + React 19.x 설치 완료. localhost:3000에서 확인 가능합니다."

#### **사용자 확인**
- 브라우저에서 `localhost:3000` 접속 → 기본 화면 표시 확인
- 승인: "좋아, MT-0.2 진행해줘"

---

### **Step 2: 폴더 구조 생성 (Claude)**

#### **권장 프롬프트 (사용자 → Claude)**
```markdown
MT-0.2 (필수): 폴더 구조 생성
- 핵심: CLAUDE.md에 명시된 구조 그대로
- 검증: tree src/ 또는 ls -R src/ 실행
- 포기 기준: N/A (폴더 생성은 실패 없음)

참고: CLAUDE.md의 "Folder structure (App Router)" 섹션
```

#### **Claude 작업**
1. `src/` 하위 폴더 생성:
   - `app/`, `components/ui/`, `components/shared/`, `features/wizard/`, `features/run/`, `lib/`, `contracts/`
2. 각 폴더에 `.gitkeep` 생성 (빈 폴더 커밋용)
3. `tree src/` 또는 `ls -R src/` 실행 → 구조 확인
4. 보고: "MT-0.2 완료. 폴더 구조 생성 완료. tree 결과: [출력]"

---

### **Step 3: ESLint + Prettier 설정 (Claude)**

#### **권장 프롬프트 (사용자 → Claude)**
```markdown
MT-0.3 (필수): ESLint + Prettier 설정
- 핵심: Flat Config, React 19 규칙, eval/innerHTML 금지
- 검증: npm run lint → 0 errors
- 포기 기준: ESLint 설정 충돌 2회 → 최소 설정으로 우회

참고: CLAUDE.md의 "LOCK-SEC-UI-01" (보안 금지 사항)
```

#### **Claude 작업**
1. `eslint.config.js` 생성 (Flat Config, React 19, no-eval 규칙)
2. `.prettierrc` 생성
3. `package.json`에 스크립트 추가:
   ```json
   "scripts": {
     "format": "prettier --write \"src/**/*.{ts,tsx}\"",
     "lint": "next lint",
     "typecheck": "tsc --noEmit"
   }
   ```
4. `npm run lint` 실행 → 0 errors 확인
5. 보고: "MT-0.3 완료. ESLint + Prettier 설정 완료. npm run lint 결과: 0 errors."

---

### **Step 4: 환경 변수 템플릿 (Claude)**

#### **권장 프롬프트 (사용자 → Claude)**
```markdown
MT-0.4 (필수): 환경 변수 템플릿
- 핵심: .env.example 작성, 실제 .env는 .gitignore
- 검증: .env.example 파일 존재 확인
- 포기 기준: N/A

참고: PROJECT_ROADMAP_v0_1.md의 MT-0.4 예시
```

#### **Claude 작업**
1. `.env.example` 생성 (Mock 모드, 폴링 간격, 파일 제한 등)
2. `.gitignore` 확인 (`.env*` 포함 여부)
3. 보고: "MT-0.4 완료. .env.example 생성 완료."

---

### **Step 5: Git 초기화 + GitHub 연결 (필수, Claude)**

#### **권장 프롬프트 (사용자 → Claude)**
```markdown
MT-0.5 (필수): Git 초기화 + GitHub 연결 + 첫 커밋
- 핵심: GitHub 저장소 ghilp934/DPP_prototype_ver_0_1 연결
- 검증: git log -1 + git remote -v + GitHub 웹 확인
- 포기 기준: push 권한 오류 → 사용자 인증 요청, 네트워크 오류 2회 → 로컬만 유지

참고: GitHub 저장소는 사전 생성 완료
```

#### **Claude 작업**
1. `git init`
2. `git remote add origin https://github.com/ghilp934/DPP_prototype_ver_0_1.git`
3. `git branch -M main`
4. `git add .`
5. `git commit -m "chore: initial project setup..."`
6. `git push -u origin main`
7. 보고: "MT-0.5 완료. GitHub 저장소 연결 및 첫 커밋 완료. https://github.com/ghilp934/DPP_prototype_ver_0_1 에서 확인 가능합니다."

#### **예상 이슈**
- **Git push 권한 오류**: 사용자에게 GitHub 인증(Personal Access Token 또는 SSH) 확인 요청
- **브랜치 충돌**: 원격에 이미 main 브랜치 존재 시 `git pull origin main --rebase` 후 재시도

---

### **Step 6: Phase 0 완료 체크리스트 (Claude)**

#### **권장 프롬프트 (사용자 → Claude)**
```markdown
Phase 0 완료 체크리스트 실행해줘.
- npm run dev → localhost:3000 정상 동작 확인
- npm run lint && npm run typecheck → 0 errors
- IMPLEMENTATION_SUMMARY.md 업데이트 (Phase 0 완료)

그리고 Phase 1 시작을 위한 권장 프롬프트를 제안해줘.
```

#### **Claude 작업**
1. `npm run dev` 실행 확인
2. `npm run lint && npm run typecheck` 실행 → 0 errors 확인
3. `IMPLEMENTATION_SUMMARY.md` 업데이트:
   ```markdown
   ### [2026-02-09] Phase 0: 프로젝트 초기화
   **Summary**: Next.js 16.x + React 19.x + TypeScript 프로젝트 설정 완료
   **Status**: ✅ PASS
   **Files Changed**: package.json, src/*, eslint.config.js, .env.example
   **Commands Run**: npm install, npm run lint, npm run typecheck, npm run dev
   **Notes**: Phase 1 준비 완료
   ```
4. Phase 1 시작 프롬프트 제안:
   ```markdown
   Phase 1 시작 준비 완료!

   다음 명령어로 Phase 1을 시작해주세요:

   "Phase 1 시작해줘 (MS-1 Skeleton).

   핵심 우선순위:
   1. Routes 생성 (필수) — /, /app, /app/new, /policies
   2. Layout 컴포넌트 (필수) — Header + Footer
   3. Constants 정의 (필수) — src/contracts/constants.ts
   4. Dashboard 기본 UI (필수) — '새 Run' 버튼만
   5. Policy 페이지 (필수) — AI 고지 + 환불 정책

   선택 작업:
   - shadcn/ui 설치 (MS-2에서 해도 됨)

   검증 방법:
   - 브라우저에서 각 라우트 접속 (내가 확인)
   - Lint/Typecheck (네가 확인)

   참고: PROJECT_ROADMAP_v0_1.md의 Phase 1 섹션"
   ```

---

## 📊 Phase 0 예상 진행 흐름

```
사용자: "Phase 0 시작해줘. MT-0.1부터 진행."
Claude: [MT-0.1 작업] → "MT-0.1 완료. localhost:3000 확인 가능합니다."
사용자: [브라우저 확인] "좋아, MT-0.2 진행해줘."
Claude: [MT-0.2 작업] → "MT-0.2 완료. 폴더 구조 생성 완료."
사용자: "MT-0.3 진행해줘."
Claude: [MT-0.3 작업] → "MT-0.3 완료. ESLint 설정 완료."
사용자: "MT-0.4 진행해줘."
Claude: [MT-0.4 작업] → "MT-0.4 완료. .env.example 생성 완료."
사용자: "MT-0.5 진행해줘."
Claude: [MT-0.5 작업 + GitHub push] → "MT-0.5 완료. GitHub 저장소 연결 및 첫 커밋 완료."
사용자: "Phase 0 완료 체크리스트 실행해줘."
Claude: [체크리스트 실행] → "Phase 0 완료! GitHub: https://github.com/ghilp934/DPP_prototype_ver_0_1 에서 확인 가능합니다. 다음은 Phase 1입니다."
```

**예상 소요**: 30분 (순수 작업 시간, 디버깅 제외)

---

## ⚠️ 예상 이슈 및 대응

### **Issue 1: Node 버전 부족**
**증상**: `npm install` 실패, "Node 24 이상 필요" 에러
**대응**:
```markdown
사용자: "Node 버전이 낮다는 에러가 나네. 어떻게 해야 해?"
Claude: "Node 24 LTS로 업그레이드가 필요합니다. nvm 사용 시:
        nvm install 24
        nvm use 24
        그 후 다시 npm install 실행해주세요."
```

### **Issue 2: ESLint 설정 충돌**
**증상**: `npm run lint` 실패, 설정 파일 오류
**대응** (1회 시도 후):
```markdown
Claude: "ESLint Flat Config 오류가 발생했습니다. 최소 설정으로 우회하겠습니다 (DEC-ESL-01).
        기본 Next.js 설정만 사용하고, React 19 규칙은 수동 추가하겠습니다."
```

### **Issue 3: Tailwind CSS 미적용**
**증상**: 브라우저에서 스타일 안 보임
**대응**:
```markdown
Claude: "tailwind.config.js 설정 확인 중... content 경로가 잘못되었습니다.
        수정: content: ['./src/**/*.{ts,tsx}']로 변경하겠습니다."
```

---

## ✅ Phase 0 완료 후 다음 단계

Phase 0 완료 체크리스트 통과 시:
1. `IMPLEMENTATION_SUMMARY.md` 업데이트 확인
2. Phase 1 시작 프롬프트 제공 (Claude가 자동 생성)
3. 사용자 승인 후 Phase 1 진행

---

**End of Phase 0 Kickoff Guide**
