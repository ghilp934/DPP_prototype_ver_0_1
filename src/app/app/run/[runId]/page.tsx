"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockApi } from "@/lib/mockApi";
import { storage } from "@/lib/storage";
import { RunDetail } from "@/contracts/run";
import { ENV } from "@/contracts/constants";

export default function RunDetailPage() {
  const params = useParams<{ runId: string }>();
  const router = useRouter();
  const runId = params.runId;

  const [run, setRun] = useState<RunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  // 폴링 로직
  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isFetching = false; // P1-2 FIX: inFlight guard

    const fetchRun = async () => {
      // P1-2 FIX: 이미 요청 중이면 skip
      if (isFetching) {
        return;
      }

      isFetching = true;

      try {
        const data = await mockApi.getRun(runId);

        if (!isMounted) {
          isFetching = false;
          return;
        }

        if (!data) {
          setError("Run을 찾을 수 없습니다.");
          setIsLoading(false);
          isFetching = false;
          return;
        }

        setRun(data);
        setIsLoading(false);
        setError(null); // D7/D8 FIX: 에러 복구 시 에러 상태 클리어

        // 터미널 상태(SUCCEEDED/FAILED)면 폴링 즉시 중단
        if (data.status === "SUCCEEDED" || data.status === "FAILED") {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (err) {
        console.error("[RunDetail] Run 조회 실패:", err);
        if (isMounted) {
          // D7/D8 FIX: 네트워크 에러는 terminal 처리 안 함 (재시도 가능)
          setError("Run 조회 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
          // 폴링은 계속 진행 (Offline 복구 대응)
        }
      } finally {
        isFetching = false;
      }
    };

    // 초기 로드 실행 후 상태에 따라 폴링 시작 여부 결정
    const initializePage = async () => {
      await fetchRun();

      // 초기 상태가 진행 중(QUEUED/RUNNING)일 때만 폴링 시작
      if (isMounted) {
        const currentRun = await mockApi.getRun(runId);
        if (
          currentRun &&
          (currentRun.status === "QUEUED" || currentRun.status === "RUNNING")
        ) {
          intervalId = setInterval(fetchRun, ENV.POLL_INTERVAL);
        }
      }
    };

    initializePage();

    // Cleanup
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [runId]);

  // D7/D8 FIX: 수동 재시도 함수
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // useEffect가 runId 의존성으로 자동 재실행됨
    window.location.reload();
  };

  // P1-3 FIX: Alert 제거 → inline message
  const handleDownload = (filename: string) => {
    // Mock: 실제로는 Blob 생성 또는 API 엔드포인트 호출
    setDownloadMessage(`다운로드 준비: ${filename} (백엔드 연동 시 실제 다운로드)`);
    setTimeout(() => setDownloadMessage(null), 3000);
  };

  // P1-3 FIX: Alert 제거 → inline message
  const handleCreateDiscardCard = () => {
    if (!run) return;

    // Discard Knowledge 저장
    const knowledge = {
      run_id: run.run_id,
      error: run.error,
      inputs: run.inputs,
      created_at: new Date().toISOString(),
    };

    // LocalStorage에 실제 저장
    storage.saveDiscardKnowledge(runId, knowledge);

    setDownloadMessage("✓ Discard Knowledge 카드가 LocalStorage에 저장되었습니다.");
    setTimeout(() => setDownloadMessage(null), 3000);
    console.log("[Discard Knowledge] Saved:", knowledge);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600">Run 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !run) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Run 상세</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">⚠️ 오류</p>
          <p className="mt-2 text-red-600">{error || "Run을 찾을 수 없습니다."}</p>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleRetry}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              🔄 재시도
            </button>
            <button
              onClick={() => router.push("/app")}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              ← Dashboard로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    const styles = {
      QUEUED: "bg-gray-100 text-gray-800",
      RUNNING: "bg-blue-100 text-blue-800",
      SUCCEEDED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* P1-3 FIX: Inline message (Toast 대체) */}
      {downloadMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">{downloadMessage}</p>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{run.run_name}</h1>
          <p className="mt-1 font-mono text-sm text-gray-500">ID: {run.run_id}</p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadge(run.status)}`}
        >
          {run.status}
        </span>
      </div>

      {/* 진행 상태 표시 (QUEUED/RUNNING) */}
      {(run.status === "QUEUED" || run.status === "RUNNING") && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {run.status === "QUEUED" ? "⏸️" : "⚙️"}
            </div>
            <div>
              <p className="font-semibold text-blue-900">
                {run.status === "QUEUED" ? "대기 중..." : "처리 중..."}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                {run.status === "QUEUED"
                  ? "곧 처리가 시작됩니다."
                  : "Decision Pack을 생성하고 있습니다. 잠시만 기다려주세요."}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-blue-200">
              <div
                className={`h-full bg-blue-600 transition-all duration-500 ${
                  run.status === "RUNNING" ? "w-3/4 animate-pulse" : "w-1/4"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Run 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Run 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600">SKU:</span>{" "}
            <span>{run.sku === "DP_GRANT" ? "DP-Grant" : "DP-RFP"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Profile:</span>{" "}
            <span>{run.profile_id}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">생성 시각:</span>{" "}
            <span>{new Date(run.created_at).toLocaleString("ko-KR")}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">마지막 업데이트:</span>{" "}
            <span>
              {run.updated_at
                ? new Date(run.updated_at).toLocaleString("ko-KR")
                : "-"}
            </span>
          </div>
          {run.inputs.secureMode && (
            <div className="col-span-2">
              <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                🔒 Secure Mode
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 결과물 다운로드 (SUCCEEDED) */}
      {run.status === "SUCCEEDED" && run.artifacts.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-green-900">
            <span className="mr-2">✓</span> 결과물 다운로드
          </h2>
          <div className="space-y-2">
            {run.artifacts.map((artifact) => (
              <div
                key={artifact.type}
                className="flex items-center justify-between rounded border border-green-200 bg-white p-3"
              >
                <div>
                  <p className="font-semibold">{artifact.filename}</p>
                  <p className="text-sm text-gray-500">
                    {artifact.type} •{" "}
                    {artifact.size_bytes
                      ? `${(artifact.size_bytes / 1024).toFixed(1)} KB`
                      : "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(artifact.filename)}
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  ⬇ 다운로드
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex space-x-4">
            <Link
              href={`/app/run/${run.run_id}/log`}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              📋 Manifest 보기
            </Link>
          </div>
        </div>
      )}

      {/* 실패 상태 (FAILED) */}
      {run.status === "FAILED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-red-900">
            <span className="mr-2">⚠️</span> 처리 실패
          </h2>
          <div className="mb-4 rounded border border-red-200 bg-white p-4">
            <p className="font-semibold text-red-800">
              {run.error?.message || "알 수 없는 오류가 발생했습니다."}
            </p>
            {run.error?.details && (
              <p className="mt-2 text-sm text-gray-600">{run.error.details}</p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCreateDiscardCard}
              className="w-full rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            >
              📝 Discard Knowledge 카드 생성
            </button>
            <p className="text-sm text-gray-600">
              실패한 Run의 정보를 Discard Knowledge로 저장하여 향후 참고할 수
              있습니다.
            </p>
          </div>

          <div className="mt-4">
            <Link
              href={`/app/run/${run.run_id}/log`}
              className="inline-block rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              📋 Manifest 보기 (디버깅용)
            </Link>
          </div>
        </div>
      )}

      {/* 입력 요약 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-semibold">입력 요약</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">Sources:</span>{" "}
            {run.inputs.sources.files.length}개 파일,{" "}
            {run.inputs.sources.urls.length}개 URL
          </div>
          <div>
            <span className="font-semibold">출력 형식:</span>{" "}
            {run.inputs.output.formats.join(", ")}
          </div>
          <div>
            <span className="font-semibold">근거 수준:</span>{" "}
            {run.inputs.output.evidenceLevel === "minimal"
              ? "Minimal"
              : "Standard"}
          </div>
          {run.inputs.context.grant && (
            <div>
              <span className="font-semibold">프로젝트명:</span>{" "}
              {run.inputs.context.grant.projectName}
            </div>
          )}
          {run.inputs.context.rfp && (
            <>
              <div>
                <span className="font-semibold">발주 기관:</span>{" "}
                {run.inputs.context.rfp.agency}
              </div>
              <div>
                <span className="font-semibold">사업 범위:</span>{" "}
                {run.inputs.context.rfp.scope.substring(0, 100)}
                {run.inputs.context.rfp.scope.length > 100 ? "..." : ""}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dashboard 돌아가기 */}
      <div className="flex justify-start">
        <button
          onClick={() => router.push("/app")}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          ← Dashboard로 돌아가기
        </button>
      </div>
    </div>
  );
}
