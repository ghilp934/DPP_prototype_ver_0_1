// LOCK-ERR-01: Error 코드 테이블 (LOCKED)

export const ERROR_CODES = {
  // Upload Errors
  ERR_UPLOAD_UNSUPPORTED: "ERR-UPLOAD-001",
  ERR_UPLOAD_TOO_LARGE: "ERR-UPLOAD-002",
  ERR_UPLOAD_TOTAL_EXCEEDED: "ERR-UPLOAD-003",

  // URL Errors
  ERR_URL_INVALID: "ERR-URL-001",
  ERR_URL_LIMIT_EXCEEDED: "ERR-URL-002",
  ERR_URL_FETCH_FAILED: "ERR-URL-003",

  // Validation Errors
  ERR_VALIDATION_REQUIRED: "ERR-VAL-001",
  ERR_VALIDATION_FORMAT: "ERR-VAL-002",
  ERR_VALIDATION_RANGE: "ERR-VAL-003",

  // Run Errors
  ERR_RUN_CREATE_FAILED: "ERR-RUN-001",
  ERR_RUN_NOT_FOUND: "ERR-RUN-002",
  ERR_RUN_INVALID_STATE: "ERR-RUN-003",

  // Payment Errors
  ERR_PAY_FAILED: "ERR-PAY-001",
  ERR_PAY_TIMEOUT: "ERR-PAY-002",

  // System Errors
  ERR_SYSTEM_UNAVAILABLE: "ERR-SYS-001",
  ERR_SYSTEM_TIMEOUT: "ERR-SYS-002",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Upload
  "ERR-UPLOAD-001": "지원하지 않는 파일 형식입니다.",
  "ERR-UPLOAD-002": "파일 크기가 제한을 초과했습니다.",
  "ERR-UPLOAD-003": "전체 파일 크기가 제한을 초과했습니다.",

  // URL
  "ERR-URL-001": "유효하지 않은 URL 형식입니다.",
  "ERR-URL-002": "URL 개수가 제한을 초과했습니다.",
  "ERR-URL-003": "URL에서 콘텐츠를 가져올 수 없습니다.",

  // Validation
  "ERR-VAL-001": "필수 입력 항목이 누락되었습니다.",
  "ERR-VAL-002": "입력 형식이 올바르지 않습니다.",
  "ERR-VAL-003": "입력 값이 허용 범위를 벗어났습니다.",

  // Run
  "ERR-RUN-001": "Run 생성에 실패했습니다.",
  "ERR-RUN-002": "Run을 찾을 수 없습니다.",
  "ERR-RUN-003": "Run 상태가 올바르지 않습니다.",

  // Payment
  "ERR-PAY-001": "결제 처리에 실패했습니다.",
  "ERR-PAY-002": "결제 시간이 초과되었습니다.",

  // System
  "ERR-SYS-001": "시스템을 사용할 수 없습니다.",
  "ERR-SYS-002": "요청 시간이 초과되었습니다.",
};

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || "알 수 없는 오류가 발생했습니다.";
}
