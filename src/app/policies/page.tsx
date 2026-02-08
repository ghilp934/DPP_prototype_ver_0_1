export default function PoliciesPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold">이용 정책</h1>

      {/* AI 고지 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">AI 사용 고지</h2>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm leading-relaxed text-gray-700">
            본 서비스는 AI 기술을 활용하여 의사결정 패키지를 생성합니다.
            생성된 결과물은 참고용으로만 사용되어야 하며, 최종 의사결정은
            사용자의 책임 하에 이루어져야 합니다.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            AI가 생성한 내용의 정확성, 완전성, 적시성에 대해 보증하지 않으며,
            이로 인한 손해에 대해 책임지지 않습니다.
          </p>
        </div>
      </section>

      {/* 환불 정책 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">환불 정책</h2>
        <div className="rounded-lg border border-gray-200 p-6">
          <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
            <li>
              Run 생성 실패 시: 전액 환불 (FAILED 상태 확정 후 7일 이내 신청)
            </li>
            <li>
              Run 생성 성공 후: 환불 불가 (Artifact 다운로드 완료 시점 기준)
            </li>
            <li>결제 오류 시: 고객센터 문의 (support@example.com)</li>
          </ul>
        </div>
      </section>

      {/* 개인정보 처리방침 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">개인정보 처리방침</h2>
        <div className="rounded-lg border border-gray-200 p-6">
          <p className="text-sm leading-relaxed text-gray-700">
            v0.1 프로토타입에서는 최소한의 정보만 수집합니다:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
            <li>Run 생성 메타데이터 (파일명, 크기, 해시)</li>
            <li>LocalStorage 기반 임시 저장 (브라우저 로컬)</li>
            <li>서버 전송 없음 (Mock API 사용)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
