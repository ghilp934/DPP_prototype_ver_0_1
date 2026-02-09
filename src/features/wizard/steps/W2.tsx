"use client";

import { useState } from "react";
import { useWizard } from "../WizardContext";
import { ENV } from "@/contracts/constants";

export function WizardStep2() {
  const { state, dispatch } = useWizard();
  const [urlInput, setUrlInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors: string[] = [];

    files.forEach((file) => {
      // 파일 크기 검증
      if (file.size > ENV.MAX_FILE_SIZE) {
        newErrors.push(
          `${file.name}: 파일 크기가 ${ENV.MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`
        );
        return;
      }

      // 총 파일 크기 검증
      const totalSize =
        state.sources.files.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (totalSize > ENV.MAX_TOTAL_SIZE) {
        newErrors.push(
          `총 파일 크기가 ${ENV.MAX_TOTAL_SIZE / 1024 / 1024}MB를 초과합니다.`
        );
        return;
      }

      dispatch({ type: "ADD_FILE", payload: file });
    });

    setErrors(newErrors);
  };

  const handleAddUrl = () => {
    const newErrors: string[] = [];

    // URL 형식 검증
    try {
      new URL(urlInput);
    } catch {
      newErrors.push("유효한 URL 형식이 아닙니다.");
      setErrors(newErrors);
      return;
    }

    // URL 개수 제한 검증
    if (state.sources.urls.length >= ENV.MAX_URL_COUNT) {
      newErrors.push(`URL은 최대 ${ENV.MAX_URL_COUNT}개까지 입력 가능합니다.`);
      setErrors(newErrors);
      return;
    }

    dispatch({ type: "ADD_URL", payload: urlInput });
    setUrlInput("");
    setErrors([]);
  };

  const canProceed =
    state.sources.files.length > 0 || state.sources.urls.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 2: Sources 입력</h2>

      {/* 파일 업로드 */}
      <div>
        <label htmlFor="file-upload" className="mb-2 block font-semibold">파일 업로드</label>
        <input
          type="file"
          id="file-upload"
          name="fileUpload"
          multiple
          onChange={handleFileUpload}
          className="w-full rounded-md border border-gray-300 px-4 py-2"
        />
        <p className="mt-1 text-sm text-gray-500">
          파일당 최대 {ENV.MAX_FILE_SIZE / 1024 / 1024}MB, 총{" "}
          {ENV.MAX_TOTAL_SIZE / 1024 / 1024}MB
        </p>

        {/* 업로드된 파일 목록 */}
        {state.sources.files.length > 0 && (
          <div className="mt-4 space-y-2">
            {state.sources.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded border border-gray-200 p-2"
              >
                <span className="text-sm">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={() => dispatch({ type: "REMOVE_FILE", payload: index })}
                  className="text-sm text-red-600 hover:underline"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* URL 입력 (Secure Mode 대응) */}
      {!state.secureMode && (
        <div>
          <label htmlFor="url-input" className="mb-2 block font-semibold">URL 추가</label>
          <div className="flex space-x-2">
            <input
              type="url"
              id="url-input"
              name="urlInput"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="flex-1 rounded-md border border-gray-300 px-4 py-2"
              onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
            />
            <button
              onClick={handleAddUrl}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              추가
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            최대 {ENV.MAX_URL_COUNT}개까지 입력 가능
          </p>

          {/* 추가된 URL 목록 */}
          {state.sources.urls.length > 0 && (
            <div className="mt-4 space-y-2">
              {state.sources.urls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded border border-gray-200 p-2"
                >
                  <span className="text-sm">{url}</span>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_URL", payload: index })
                    }
                    className="text-sm text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secure Mode 알림 */}
      {state.secureMode && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold">🔒 Secure Mode 활성화</p>
          <p className="mt-1 text-sm text-gray-600">
            URL 입력이 비활성화되었습니다. 로컬 파일만 업로드 가능합니다.
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              ⚠️ {error}
            </p>
          ))}
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
