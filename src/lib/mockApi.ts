import { nanoid } from "nanoid";
import { RunDetail, RunSummary, RunManifest, Artifact } from "@/contracts/run";
import { RunStatus } from "@/contracts/constants";
import { WizardState } from "@/features/wizard/WizardContext";
import { storage } from "./storage";

// In-Memory 상태 맵 (폴링 중 임시 상태)
const runStatusMap = new Map<string, RunStatus>();

// P0-1: 타이머 중복 방지용 플래그
const scheduledRuns = new Set<string>();

/**
 * Mock API Provider
 * @description Phase 3용 Mock API (LocalStorage + In-Memory 기반)
 */
export const mockApi = {
  /**
   * POST /api/runs - Run 생성
   * @param inputs Wizard 입력 상태
   * @returns 생성된 Run 요약 정보
   */
  async createRun(inputs: WizardState): Promise<RunSummary> {
    // P0-2 FIX: React state mutation 방지 - deepClone 후 sanitize
    const sanitizedInputs: WizardState = JSON.parse(JSON.stringify(inputs));

    // Secure Mode 가드: URL이 남아있으면 강제 초기화 (LOCK-RFP-SEC-01)
    if (sanitizedInputs.secureMode && sanitizedInputs.sources.urls.length > 0) {
      console.warn(
        "[mockApi] Secure Mode enabled but URLs detected. Clearing URLs."
      );
      sanitizedInputs.sources.urls = [];
    }

    // Run ID 생성 (nanoid 12자리)
    const runId = `run_${nanoid(12)}`;
    const now = new Date().toISOString();

    // Manifest 생성
    const manifest = generateManifest(sanitizedInputs, runId, now);

    // Run 상세 정보 생성
    const run: RunDetail = {
      run_id: runId,
      created_at: now,
      updated_at: now,
      sku: sanitizedInputs.sku!,
      profile_id: sanitizedInputs.profileId!,
      run_name: sanitizedInputs.runName || `Run ${runId}`,
      status: "QUEUED",
      inputs: sanitizedInputs,
      manifest,
      artifacts: [],
    };

    // LocalStorage 저장
    storage.saveRun(run);

    // In-Memory 상태 초기화
    runStatusMap.set(runId, "QUEUED");

    // 상태 전환 타이머 시작 (비동기)
    scheduleStatusTransition(runId);

    // Run 요약 정보 반환
    return {
      run_id: run.run_id,
      sku: run.sku,
      profile_id: run.profile_id,
      status: run.status,
      created_at: run.created_at,
      run_name: run.run_name,
    };
  },

  /**
   * GET /api/runs/:runId - Run 조회
   * @param runId Run ID
   * @returns Run 상세 정보 또는 null
   */
  async getRun(runId: string): Promise<RunDetail | null> {
    // LocalStorage에서 Run 복원
    const run = storage.getRun(runId);
    if (!run) return null;

    // P0-1 FIX: 터미널 상태는 재계산 안 함 (불변)
    if (run.status === "SUCCEEDED" || run.status === "FAILED") {
      return run;
    }

    // P0-1 FIX: created_at 기반 결정론적 상태 재계산 (새로고침 복구)
    const elapsedMs = Date.now() - new Date(run.created_at).getTime();
    const computedStatus = computeStatusFromElapsed(runId, elapsedMs);

    // In-Memory 상태 확인 (최신 상태 우선)
    const memoryStatus = runStatusMap.get(runId);
    const finalStatus = memoryStatus || computedStatus;

    // 상태가 변경되었으면 동기화
    if (finalStatus !== run.status) {
      run.status = finalStatus;
      run.updated_at = new Date().toISOString();
      storage.saveRun(run);

      // 터미널 상태 도달 시 artifacts/error 생성
      if (finalStatus === "SUCCEEDED" && run.artifacts.length === 0) {
        generateArtifacts(runId);
      } else if (finalStatus === "FAILED" && !run.error) {
        generateError(runId);
      }
    }

    // 진행 중 상태면 타이머 재스케줄 (새로고침 복구)
    if (finalStatus === "QUEUED" || finalStatus === "RUNNING") {
      scheduleStatusTransition(runId);
    }

    return run;
  },

  /**
   * GET /api/runs - Run 리스트 조회
   * @returns Run 요약 정보 배열
   */
  async getRunsList(): Promise<RunSummary[]> {
    return storage.getRunsList();
  },

  /**
   * DELETE /api/runs/:runId - Run 삭제
   * @param runId Run ID
   */
  async deleteRun(runId: string): Promise<void> {
    // In-Memory 상태 제거
    runStatusMap.delete(runId);

    // LocalStorage에서 삭제
    storage.deleteRun(runId);
  },
};

/**
 * P0-1: 경과 시간 기반 상태 계산 (결정론적)
 * @param runId Run ID (시드용)
 * @param elapsedMs created_at으로부터 경과 시간 (ms)
 * @returns 계산된 RunStatus
 */
function computeStatusFromElapsed(runId: string, elapsedMs: number): RunStatus {
  // 0~2초: QUEUED
  if (elapsedMs < 2000) {
    return "QUEUED";
  }

  // 2~7초 (평균 5초): RUNNING
  // runId 기반 시드로 전환 시점 결정 (5~10초 사이)
  const seed = runId.charCodeAt(runId.length - 1) % 5000; // 0~4999ms
  const transitionTime = 2000 + 5000 + seed; // 7~12초

  if (elapsedMs < transitionTime) {
    return "RUNNING";
  }

  // 7초+ (시드 기반): SUCCEEDED (80%) or FAILED (20%)
  const successSeed = runId.charCodeAt(0) % 10; // 0~9
  return successSeed < 8 ? "SUCCEEDED" : "FAILED";
}

/**
 * 상태 전환 타이머 (LOCK-STATE-01)
 * @param runId Run ID
 * @description QUEUED → RUNNING → SUCCEEDED/FAILED 자동 전환
 */
function scheduleStatusTransition(runId: string): void {
  // P0-1 FIX: 중복 스케줄 방지
  if (scheduledRuns.has(runId)) {
    return;
  }
  scheduledRuns.add(runId);
  // QUEUED → RUNNING (2초 후)
  setTimeout(() => {
    updateRunStatus(runId, "RUNNING");

    // RUNNING → SUCCEEDED/FAILED (5~10초 랜덤)
    const seed = runId.charCodeAt(runId.length - 1) % 5000;
    const duration = 5000 + seed;
    setTimeout(() => {
      const successSeed = runId.charCodeAt(0) % 10;
      const success = successSeed < 8; // 80% 성공률 (시드 기반)
      const finalStatus: RunStatus = success ? "SUCCEEDED" : "FAILED";

      updateRunStatus(runId, finalStatus);

      if (success) {
        generateArtifacts(runId);
      } else {
        generateError(runId);
      }

      // P0-1 FIX: 타이머 완료 시 스케줄 플래그 제거
      scheduledRuns.delete(runId);
    }, duration);
  }, 2000);
}

/**
 * Run 상태 업데이트
 * @param runId Run ID
 * @param status 새 상태
 */
function updateRunStatus(runId: string, status: RunStatus): void {
  // In-Memory 상태 업데이트
  runStatusMap.set(runId, status);

  // LocalStorage 동기화
  const run = storage.getRun(runId);
  if (run) {
    run.status = status;
    run.updated_at = new Date().toISOString();
    storage.saveRun(run);
  }
}

/**
 * Artifacts 생성 (SUCCEEDED 시)
 * @param runId Run ID
 */
function generateArtifacts(runId: string): void {
  const run = storage.getRun(runId);
  if (!run) return;

  const artifacts: Artifact[] = [
    {
      type: "PACK_PDF",
      filename: `Pack_${runId}.pdf`,
      sha256: `sha256_${nanoid(16)}`,
      size_bytes: 1024 * 500, // 500KB (Mock)
      created_at: new Date().toISOString(),
    },
    {
      type: "RUN_MANIFEST_JSON",
      filename: `Run_Manifest_${runId}.json`,
      sha256: `sha256_${nanoid(16)}`,
      size_bytes: 1024 * 50, // 50KB (Mock)
      created_at: new Date().toISOString(),
    },
  ];

  // DOCX 선택 시 추가
  if (run.inputs.output.formats.includes("DOCX")) {
    artifacts.push({
      type: "PACK_DOCX",
      filename: `Pack_${runId}.docx`,
      sha256: `sha256_${nanoid(16)}`,
      size_bytes: 1024 * 600,
      created_at: new Date().toISOString(),
    });
  }

  // PPTX 선택 시 추가
  if (run.inputs.output.formats.includes("PPTX")) {
    artifacts.push({
      type: "PACK_PPTX",
      filename: `Pack_${runId}.pptx`,
      sha256: `sha256_${nanoid(16)}`,
      size_bytes: 1024 * 800,
      created_at: new Date().toISOString(),
    });
  }

  // Evidence CSV (Standard 레벨 시)
  if (run.inputs.output.evidenceLevel === "standard") {
    artifacts.push({
      type: "EVIDENCE_CSV",
      filename: `Evidence_${runId}.csv`,
      sha256: `sha256_${nanoid(16)}`,
      size_bytes: 1024 * 100,
      created_at: new Date().toISOString(),
    });
  }

  run.artifacts = artifacts;
  run.manifest.outputs.artifacts = artifacts;
  storage.saveRun(run);
}

/**
 * Error 정보 생성 (FAILED 시)
 * @param runId Run ID
 */
function generateError(runId: string): void {
  const run = storage.getRun(runId);
  if (!run) return;

  run.error = {
    code: "ERR-RUN-FAILED",
    message: "처리 중 오류가 발생했습니다.",
    details: "Mock API: 랜덤 실패 (20% 확률)",
  };

  storage.saveRun(run);
}

/**
 * Manifest 생성
 * @param inputs Wizard 입력
 * @param runId Run ID
 * @param createdAt 생성 시각
 * @returns RunManifest
 */
function generateManifest(
  inputs: WizardState,
  runId: string,
  createdAt: string
): RunManifest {
  return {
    run_id: runId,
    created_at: createdAt,
    sku: inputs.sku!,
    profile_id: inputs.profileId!,
    ruleset_version: "v0.2.1",
    secure_mode: {
      enabled: inputs.secureMode,
      mode: inputs.secureMode ? "airgap" : "cloud",
    },
    inputs: {
      files: inputs.sources.files.map((file) => ({
        filename: file.name,
        size_bytes: file.size,
        sha256: `sha256_${nanoid(16)}`, // Mock hash
      })),
      urls: inputs.sources.urls.map((url) => ({
        canonical: url,
        scraped_at: createdAt,
      })),
    },
    gates: {
      mode: inputs.profileId === "P1" ? "fast" : "standard",
      thresholds: {
        min_evidence: inputs.output.evidenceLevel === "minimal" ? 1 : 2,
        max_tokens: inputs.profileId === "P1" ? 50000 : 100000,
      },
    },
    outputs: {
      artifacts: [], // generateArtifacts에서 채움
    },
    audit: {
      decisions: [
        {
          gate_id: "GATE_FILE_SIZE",
          result: "pass",
          reason: "모든 파일이 크기 제한 내",
        },
        {
          gate_id: "GATE_URL_COUNT",
          result: "pass",
          reason: `URL 개수: ${inputs.sources.urls.length}/30`,
        },
      ],
      warnings: inputs.secureMode
        ? ["Secure Mode 활성화: URL 수집 비활성"]
        : [],
    },
  };
}
