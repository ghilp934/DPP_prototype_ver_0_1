"use client";

import { useWizard } from "../WizardContext";

const AVAILABLE_FORMATS = [
  { value: "PDF", label: "PDF" },
  { value: "DOCX", label: "DOCX (Word)" },
  { value: "PPTX", label: "PPTX (PowerPoint)" },
];

export function WizardStep3() {
  const { state, dispatch } = useWizard();

  const toggleFormat = (format: string) => {
    const currentFormats = state.output.formats;
    const newFormats = currentFormats.includes(format)
      ? currentFormats.filter((f) => f !== format)
      : [...currentFormats, format];

    dispatch({ type: "SET_OUTPUT_FORMATS", payload: newFormats });
  };

  const canProceed = state.output.formats.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 3: Output 설정</h2>

      {/* 출력 형식 선택 */}
      <div>
        <fieldset>
          <legend className="mb-2 block font-semibold">
            출력 형식 <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {AVAILABLE_FORMATS.map((format) => (
              <label key={format.value} htmlFor={`format-${format.value}`} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`format-${format.value}`}
                  name={`format-${format.value}`}
                  checked={state.output.formats.includes(format.value)}
                  onChange={() => toggleFormat(format.value)}
                  className="h-4 w-4"
                />
                <span>{format.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            선택된 형식: {state.output.formats.join(", ") || "없음"}
          </p>
        </fieldset>
      </div>

      {/* 근거(Evidence) 수준 */}
      <div>
        <fieldset>
          <legend className="mb-2 block font-semibold">
            근거(Evidence) 수준
          </legend>
          <div className="space-y-2">
            <label htmlFor="evidence-minimal" className="flex items-center space-x-2">
              <input
                type="radio"
                id="evidence-minimal"
                name="evidenceLevel"
                value="minimal"
                checked={state.output.evidenceLevel === "minimal"}
                onChange={() =>
                  dispatch({
                    type: "SET_EVIDENCE_LEVEL",
                    payload: "minimal",
                  })
                }
                className="h-4 w-4"
              />
              <span>Minimal (요약만)</span>
            </label>
            <label htmlFor="evidence-standard" className="flex items-center space-x-2">
              <input
                type="radio"
                id="evidence-standard"
                name="evidenceLevel"
                value="standard"
                checked={state.output.evidenceLevel === "standard"}
                onChange={() =>
                  dispatch({
                    type: "SET_EVIDENCE_LEVEL",
                    payload: "standard",
                  })
                }
                className="h-4 w-4"
              />
              <span>Standard (근거 포함)</span>
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Standard 선택 시 Evidence CSV가 추가로 생성됩니다.
          </p>
        </fieldset>
      </div>

      {/* Profile별 추가 옵션 표시 (Progressive Disclosure) */}
      {state.profileId === "P3" && (
        <div className="rounded border border-blue-200 bg-blue-50 p-4">
          <p className="font-semibold">💼 Power/Pro 전용 옵션</p>
          <p className="mt-2 text-sm text-gray-600">
            Quick-Pass 템플릿 저장 기능은 Phase 3에서 구현 예정입니다.
          </p>
        </div>
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
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          disabled={!canProceed}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
