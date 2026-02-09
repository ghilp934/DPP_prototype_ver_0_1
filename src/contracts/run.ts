import { SKU, ProfileId, RunStatus, ArtifactType } from "./constants";
import { WizardState } from "@/features/wizard/WizardContext";

// Artifact 정보
export interface Artifact {
  type: ArtifactType;
  filename: string;
  sha256: string;
  size_bytes?: number;
  created_at?: string;
}

// Run Manifest 구조 (LOCK-LOG-01)
export interface RunManifest {
  run_id: string;
  created_at: string;
  sku: SKU;
  profile_id: ProfileId;
  ruleset_version: string;
  secure_mode: {
    enabled: boolean;
    mode: "cloud" | "airgap";
  };
  inputs: {
    files: Array<{
      filename: string;
      size_bytes: number;
      sha256: string;
    }>;
    urls: Array<{
      canonical: string;
      scraped_at?: string;
    }>;
  };
  gates: {
    mode: string;
    thresholds: Record<string, unknown>;
  };
  outputs: {
    artifacts: Artifact[];
  };
  audit: {
    decisions: Array<{
      gate_id: string;
      result: "pass" | "fail" | "warn";
      reason: string;
    }>;
    warnings: string[];
  };
}

// Run 요약 정보 (Dashboard용)
export interface RunSummary {
  run_id: string;
  sku: SKU;
  profile_id: ProfileId;
  status: RunStatus;
  created_at: string;
  run_name: string;
}

// Run 상세 정보 (Run Detail 페이지용)
export interface RunDetail {
  run_id: string;
  created_at: string;
  updated_at?: string;
  sku: SKU;
  profile_id: ProfileId;
  run_name: string;
  status: RunStatus;
  inputs: WizardState; // Wizard 입력 전체 저장
  manifest: RunManifest;
  artifacts: Artifact[];
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}
