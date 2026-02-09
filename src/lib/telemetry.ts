/**
 * Telemetry Event Logging (TC-SMK-07)
 *
 * 현재: 콘솔 출력 + in-memory queue
 * 향후: 백엔드 전송 (POST /api/telemetry)
 */

/**
 * Telemetry 이벤트 타입 정의 (Union Type)
 *
 * 각 이벤트는 고유한 type과 payload를 가지며,
 * 타입 안전성을 보장합니다.
 *
 * 새로운 이벤트 추가 시:
 * 1. 이 union type에 새 이벤트 타입 추가
 * 2. payload 필드 명확히 정의
 * 3. logEvent() 함수는 자동으로 타입 체크
 */
export type TelemetryEvent =
  | {
      type: "ui.wizard.step_viewed";
      step_id: string;
      profile_id: string;
    }
  | {
      type: "run.result.downloaded";
      artifact_type: string;
    };
// 향후 추가 예시:
// | { type: "run.created"; run_id: string; sku: string }
// | { type: "ui.button.clicked"; button_id: string; page: string }

/**
 * Telemetry 이벤트 로깅 함수
 *
 * @param event - TelemetryEvent union type (타입 안전성 보장)
 *
 * 현재 동작:
 * - 콘솔에 [Telemetry] 태그와 함께 이벤트 출력
 * - 개발 환경에서 즉시 확인 가능
 *
 * 향후 개선 (Phase 5+):
 * - 이벤트를 in-memory queue에 저장
 * - 백엔드 API로 배치 전송 (POST /api/telemetry)
 * - 전송 실패 시 재시도 로직
 * - 프로덕션 환경에서만 전송 (process.env.NODE_ENV === 'production')
 */
export function logEvent(event: TelemetryEvent): void {
  // 현재: 콘솔 출력
  console.log("[Telemetry]", event);

  // 향후 백엔드 전송 예시:
  // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  //   fetch('/api/telemetry', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       ...event,
  //       timestamp: new Date().toISOString(),
  //       session_id: getSessionId(),
  //     }),
  //   }).catch(err => console.error('[Telemetry] 전송 실패:', err));
  // }
}

/**
 * 사용 예시:
 *
 * import { logEvent } from '@/lib/telemetry';
 *
 * // Wizard step 변경 시
 * logEvent({
 *   type: "ui.wizard.step_viewed",
 *   step_id: "step-profile",
 *   profile_id: "DP_GRANT"
 * });
 *
 * // 다운로드 시
 * logEvent({
 *   type: "run.result.downloaded",
 *   artifact_type: "manifest_json"
 * });
 */
