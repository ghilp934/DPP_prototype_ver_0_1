"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockApi } from "@/lib/mockApi";
import { RunDetail } from "@/contracts/run";
import { logEvent } from "@/lib/telemetry";

export default function LogPage() {
  const params = useParams<{ runId: string }>();
  const router = useRouter();
  const runId = params.runId;

  const [run, setRun] = useState<RunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchRun = async () => {
      try {
        const data = await mockApi.getRun(runId);
        if (!data) {
          setError("Run을 찾을 수 없습니다.");
          setIsLoading(false);
          return;
        }
        setRun(data);
        setIsLoading(false);
      } catch (err) {
        console.error("[LogPage] Run 조회 실패:", err);
        setError("Run 조회 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    fetchRun();
  }, [runId]);

  // Manifest JSON 다운로드
  const handleDownload = () => {
    if (!run) return;

    // Telemetry: 다운로드 이벤트 로깅
    logEvent({
      type: "run.result.downloaded",
      artifact_type: "manifest_json",
    });

    const json = JSON.stringify(run.manifest, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Run_Manifest_${runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Manifest JSON 복사
  const handleCopy = async () => {
    if (!run) return;

    try {
      const json = JSON.stringify(run.manifest, null, 2);
      await navigator.clipboard.writeText(json);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("[LogPage] 복사 실패:", err);
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600">Manifest를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !run) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Log & Manifest</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">⚠️ 오류</p>
          <p className="mt-2 text-red-600">{error || "Run을 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.push("/app")}
            className="mt-4 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            ← Dashboard로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Log & Manifest</h1>
          <p className="mt-1 text-sm text-gray-500">Run ID: {runId}</p>
        </div>
        <button
          onClick={() => router.push(`/app/run/${runId}`)}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          ← Run 상세로 돌아가기
        </button>
      </div>

      {/* Run 기본 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Run 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600">Run 이름:</span>{" "}
            <span>{run.run_name}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">상태:</span>{" "}
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${
                run.status === "SUCCEEDED"
                  ? "bg-green-100 text-green-800"
                  : run.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {run.status}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">SKU:</span>{" "}
            <span>{run.sku === "DP_GRANT" ? "DP-Grant" : "DP-RFP"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Profile:</span>{" "}
            <span>{run.profile_id}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-gray-600">생성 시각:</span>{" "}
            <span>{new Date(run.created_at).toLocaleString("ko-KR")}</span>
          </div>
        </div>
      </div>

      {/* Manifest Viewer */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Run Manifest (LOCK-LOG-01)</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              {copySuccess ? "✓ 복사됨!" : "📋 복사"}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              ⬇ 다운로드
            </button>
          </div>
        </div>

        <div className="rounded border border-gray-300 bg-gray-50 p-4">
          <pre className="max-h-96 overflow-auto text-sm">
            {JSON.stringify(run.manifest, null, 2)}
          </pre>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          💡 Tip: Manifest는 Run의 전체 입력, 설정, 감사 추적 정보를 포함합니다.
          디버깅 및 재현성 확보를 위해 저장하세요.
        </p>
      </div>

      {/* Manifest 주요 정보 요약 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Manifest 요약</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold text-gray-600">Ruleset 버전:</span>{" "}
            <span className="font-mono text-xs">{run.manifest.ruleset_version}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Secure Mode:</span>{" "}
            <span>
              {run.manifest.secure_mode.enabled ? (
                <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                  🔒 {run.manifest.secure_mode.mode.toUpperCase()}
                </span>
              ) : (
                <span className="text-gray-500">비활성</span>
              )}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">입력 파일:</span>{" "}
            <span>{run.manifest.inputs.files.length}개</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">입력 URL:</span>{" "}
            <span>{run.manifest.inputs.urls.length}개</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Gates 모드:</span>{" "}
            <span className="font-mono text-xs">{run.manifest.gates.mode}</span>
          </div>
          {run.manifest.audit.warnings.length > 0 && (
            <div>
              <span className="font-semibold text-gray-600">경고:</span>
              <ul className="ml-4 mt-1 list-disc text-yellow-700">
                {run.manifest.audit.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
