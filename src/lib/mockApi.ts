import { nanoid } from "nanoid";
import { RunDetail, RunSummary, RunManifest, Artifact } from "@/contracts/run";
import { RunStatus } from "@/contracts/constants";
import { WizardState } from "@/features/wizard/WizardContext";
import { storage } from "./storage";

// In-Memory 상태 맵 (폴링 중 임시 상태)
const runStatusMap = new Map<string, RunStatus>();

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
    // Run ID 생성 (nanoid 12자리)
    const runId = `run_${nanoid(12)}`;
    const now = new Date().toISOString();

    // Manifest 생성
    const manifest = generateManifest(inputs, runId, now);

    // Run 상세 정보 생성
    const run: RunDetail = {
      run_id: runId,
      created_at: now,
      updated_at: now,
      sku: inputs.sku!,
      profile_id: inputs.profileId!,
      run_name: inputs.runName || `Run ${runId}`,
      status: "QUEUED",
      inputs,
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
    // In-Memory 상태 확인 (최신 상태)
    const memoryStatus = runStatusMap.get(runId);

    // LocalStorage에서 Run 복원
    const run = storage.getRun(runId);
    if (!run) return null;

    // In-Memory 상태가 더 최신이면 병합
    if (memoryStatus && memoryStatus !== run.status) {
      run.status = memoryStatus;
      run.updated_at = new Date().toISOString();

      // LocalStorage 동기화
      storage.saveRun(run);
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
 * 상태 전환 타이머 (LOCK-STATE-01)
 * @param runId Run ID
 * @description QUEUED → RUNNING → SUCCEEDED/FAILED 자동 전환
 */
function scheduleStatusTransition(runId: string): void {
  // QUEUED → RUNNING (2초 후)
  setTimeout(() => {
    updateRunStatus(runId, "RUNNING");

    // RUNNING → SUCCEEDED/FAILED (5~10초 랜덤)
    const duration = 5000 + Math.random() * 5000;
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% 성공률
      const finalStatus: RunStatus = success ? "SUCCEEDED" : "FAILED";

      updateRunStatus(runId, finalStatus);

      if (success) {
        generateArtifacts(runId);
      } else {
        generateError(runId);
      }
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
