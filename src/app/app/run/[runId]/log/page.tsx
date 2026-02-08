export default function LogPage({ params }: { params: { runId: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Log & Manifest</h1>
      <div className="rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Run ID: {params.runId}</p>
        <p className="mt-4 text-gray-500">
          Run Manifest 및 이벤트 로그가 여기에 표시됩니다.
        </p>
        <p className="mt-2 text-sm text-gray-400">Phase 4에서 구현 예정</p>
      </div>
    </div>
  );
}
