"use client";

import { useWizard } from "../WizardContext";
import { SKUS, PROFILES, PROFILE_FEATURES } from "@/contracts/constants";

export function WizardStep0() {
  const { state, dispatch } = useWizard();

  const canProceed = state.sku !== null && state.profileId !== null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 0: SKU 및 프로파일 선택</h2>

      {/* SKU 선택 */}
      <div>
        <fieldset>
          <legend className="mb-2 block font-semibold">
            SKU <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {SKUS.map((sku) => (
              <label key={sku} htmlFor={`sku-${sku}`} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`sku-${sku}`}
                  name="sku"
                  value={sku}
                  checked={state.sku === sku}
                  onChange={() => dispatch({ type: "SET_SKU", payload: sku })}
                  className="h-4 w-4"
                />
                <span>
                  {sku === "DP_GRANT"
                    ? "DP-Grant (지원사업)"
                    : "DP-RFP (입찰/제안서)"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Profile 선택 */}
      <div>
        <fieldset>
          <legend className="mb-2 block font-semibold">
            Profile <span className="text-red-500">*</span>
          </legend>
          <div className="space-y-2">
            {PROFILES.map((profile) => (
              <label key={profile} htmlFor={`profile-${profile}`} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`profile-${profile}`}
                  name="profile"
                  value={profile}
                  checked={state.profileId === profile}
                  onChange={() =>
                    dispatch({ type: "SET_PROFILE", payload: profile })
                  }
                  className="h-4 w-4"
                />
                <span>
                  {profile} (
                  {profile === "P1"
                    ? "Fast/Novice"
                    : profile === "P2"
                      ? "Standard"
                      : "Power/Pro"}
                  )
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Secure Mode (DP-RFP + P2/P3만) */}
      {state.sku === "DP_RFP" &&
        state.profileId &&
        PROFILE_FEATURES[state.profileId].secureMode && (
          <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
            <label htmlFor="secure-mode" className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="secure-mode"
                name="secureMode"
                checked={state.secureMode}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SECURE_MODE",
                    payload: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <span className="font-semibold">
                Secure Mode (URL 입력 제한)
              </span>
            </label>
            <p className="mt-2 text-sm text-gray-600">
              ON 시 URL 자동수집이 비활성화됩니다 (로컬/에어갭 입력만 허용).
            </p>
          </div>
        )}

      {/* 다음 버튼 */}
      <div className="flex justify-end">
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
