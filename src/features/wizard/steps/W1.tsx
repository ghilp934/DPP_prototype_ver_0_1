"use client";

import { useState } from "react";
import { useWizard } from "../WizardContext";

export function WizardStep1() {
  const { state, dispatch } = useWizard();

  // Local state for form fields
  const [grantProjectName, setGrantProjectName] = useState(
    state.context.grant?.projectName || ""
  );
  const [grantAnnouncementUrl, setGrantAnnouncementUrl] = useState(
    state.context.grant?.announcementUrl || ""
  );
  const [rfpAgency, setRfpAgency] = useState(state.context.rfp?.agency || "");
  const [rfpScope, setRfpScope] = useState(state.context.rfp?.scope || "");

  const handleNext = () => {
    if (state.sku === "DP_GRANT") {
      dispatch({
        type: "SET_GRANT_CONTEXT",
        payload: {
          projectName: grantProjectName,
          announcementUrl: grantAnnouncementUrl,
        },
      });
    } else if (state.sku === "DP_RFP") {
      dispatch({
        type: "SET_RFP_CONTEXT",
        payload: {
          agency: rfpAgency,
          scope: rfpScope,
        },
      });
    }
    dispatch({ type: "NEXT_STEP" });
  };

  const canProceed =
    state.sku === "DP_GRANT"
      ? grantProjectName.trim() !== ""
      : rfpAgency.trim() !== "" && rfpScope.trim() !== "";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 1: Context 입력</h2>

      {state.sku === "DP_GRANT" && (
        <>
          <div>
            <label htmlFor="grant-project-name" className="mb-2 block font-semibold">
              프로젝트명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="grant-project-name"
              name="grantProjectName"
              value={grantProjectName}
              onChange={(e) => setGrantProjectName(e.target.value)}
              placeholder="예: AI 기반 스마트팜 솔루션 개발"
              className="w-full rounded-md border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label htmlFor="grant-announcement-url" className="mb-2 block font-semibold">
              공고 URL (선택)
            </label>
            <input
              type="url"
              id="grant-announcement-url"
              name="grantAnnouncementUrl"
              value={grantAnnouncementUrl}
              onChange={(e) => setGrantAnnouncementUrl(e.target.value)}
              placeholder="https://www.k-startup.go.kr/..."
              className="w-full rounded-md border border-gray-300 px-4 py-2"
            />
            <p className="mt-1 text-sm text-gray-500">
              공고 URL을 입력하면 자동으로 요구사항을 추출합니다.
            </p>
          </div>
        </>
      )}

      {state.sku === "DP_RFP" && (
        <>
          <div>
            <label htmlFor="rfp-agency" className="mb-2 block font-semibold">
              발주 기관 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="rfp-agency"
              name="rfpAgency"
              value={rfpAgency}
              onChange={(e) => setRfpAgency(e.target.value)}
              placeholder="예: 행정안전부"
              className="w-full rounded-md border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label htmlFor="rfp-scope" className="mb-2 block font-semibold">
              사업 범위 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rfp-scope"
              name="rfpScope"
              value={rfpScope}
              onChange={(e) => setRfpScope(e.target.value)}
              placeholder="예: 전국 지자체 통합 재난 대응 시스템 구축..."
              rows={4}
              className="w-full rounded-md border border-gray-300 px-4 py-2"
            />
          </div>
        </>
      )}

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50"
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
