"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "../WizardContext";
import { mockApi } from "@/lib/mockApi";

export function WizardStep4() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const [aiDisclosureAgreed, setAiDisclosureAgreed] = useState(false);
  const [runName, setRunName] = useState(state.runName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Run 이름을 상태에 저장
      dispatch({ type: "SET_RUN_NAME", payload: runName });

      // Mock API로 Run 생성
      const updatedState = { ...state, runName };
      const run = await mockApi.createRun(updatedState);

      // Run 상세 페이지로 리디렉션
      router.push(`/app/run/${run.run_id}`);
    } catch (error) {
      console.error("[W4] Run 생성 실패:", error);
      alert("Run 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  };

  const canSubmit = aiDisclosureAgreed && runName.trim() !== "";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 4: Review & Submit</h2>

      {/* Run 이름 */}
      <div>
        <label htmlFor="run-name" className="mb-2 block font-semibold">
          Run 이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="run-name"
          name="runName"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          placeholder="예: 2026 스마트팜 지원사업 신청"
          className="w-full rounded-md border border-gray-300 px-4 py-2"
        />
      </div>

      {/* 입력 요약 */}
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-4 font-semibold">입력 요약</h3>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">SKU:</span>{" "}
            {state.sku === "DP_GRANT" ? "DP-Grant" : "DP-RFP"}
          </div>
          <div>
            <span className="font-semibold">Profile:</span> {state.profileId}
          </div>
          {state.secureMode && (
            <div>
              <span className="font-semibold">Secure Mode:</span> ✅ ON
            </div>
          )}

          {state.sku === "DP_GRANT" && state.context.grant && (
            <div>
              <span className="font-semibold">프로젝트명:</span>{" "}
              {state.context.grant.projectName}
            </div>
          )}

          {state.sku === "DP_RFP" && state.context.rfp && (
            <>
              <div>
                <span className="font-semibold">발주 기관:</span>{" "}
                {state.context.rfp.agency}
              </div>
              <div>
                <span className="font-semibold">사업 범위:</span>{" "}
                {state.context.rfp.scope.substring(0, 50)}...
              </div>
            </>
          )}

          <div>
            <span className="font-semibold">Sources:</span>{" "}
            {state.sources.files.length}개 파일, {state.sources.urls.length}개
            URL
          </div>

          <div>
            <span className="font-semibold">출력 형식:</span>{" "}
            {state.output.formats.join(", ")}
          </div>

          <div>
            <span className="font-semibold">근거 수준:</span>{" "}
            {state.output.evidenceLevel === "minimal" ? "Minimal" : "Standard"}
          </div>
        </div>
      </div>

      {/* AI 고지 동의 (필수) */}
      <div className="rounded border border-blue-200 bg-blue-50 p-4">
        <label htmlFor="ai-disclosure-agreed" className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="ai-disclosure-agreed"
            name="aiDisclosureAgreed"
            checked={aiDisclosureAgreed}
            onChange={(e) => setAiDisclosureAgreed(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm">
            <strong>(필수)</strong> AI 기반 생성/분석 결과물임을 확인하였으며,{" "}
            <a
              href="/policies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              정책 및 고지사항
            </a>
            에 동의합니다.
          </span>
        </label>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← 이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? "⏳ 생성 중..." : "✓ Run 생성"}
        </button>
      </div>
    </div>
  );
}
