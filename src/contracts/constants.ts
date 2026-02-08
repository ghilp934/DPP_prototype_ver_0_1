// LOCK-SKU-01: SKU는 2개만
export const SKUS = ["DP_GRANT", "DP_RFP"] as const;
export type SKU = (typeof SKUS)[number];

// LOCK-PROFILE-01: 프로파일 3종
export const PROFILES = ["P1", "P2", "P3"] as const;
export type ProfileId = (typeof PROFILES)[number];

// LOCK-STATE-01: Run 상태머신
export const RUN_STATUSES = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

// Artifact 타입
export const ARTIFACT_TYPES = [
  "PACK_PDF",
  "PACK_DOCX",
  "PACK_PPTX",
  "EVIDENCE_CSV",
  "DISCARD_LOG_CSV",
  "RUN_MANIFEST_JSON",
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

// 환경 변수 (클라이언트)
export const ENV = {
  MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE === "true",
  POLL_INTERVAL: parseInt(process.env.NEXT_PUBLIC_POLL_INTERVAL || "5000", 10),
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "52428800", 10),
  MAX_TOTAL_SIZE: parseInt(
    process.env.NEXT_PUBLIC_MAX_TOTAL_SIZE || "157286400",
    10
  ),
  MAX_URL_COUNT: parseInt(process.env.NEXT_PUBLIC_MAX_URL_COUNT || "30", 10),
} as const;

// Progressive Disclosure 규칙 (LOCK-UX-01)
export const PROFILE_FEATURES = {
  P1: {
    secureMode: false,
    quickPass: false,
    switchingSlots: 0,
    advancedGates: false,
  },
  P2: {
    secureMode: true, // DP-RFP only
    quickPass: false,
    switchingSlots: 3,
    advancedGates: true,
  },
  P3: {
    secureMode: true,
    quickPass: true,
    switchingSlots: 5,
    advancedGates: true,
  },
} as const;
