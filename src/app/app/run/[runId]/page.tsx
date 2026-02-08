export default function RunDetailPage({
  params,
}: {
  params: { runId: string };
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Run 상세</h1>
      <div className="rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Run ID: {params.runId}</p>
        <p className="mt-4 text-gray-500">
          Run 상태 및 결과가 여기에 표시됩니다.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Phase 3에서 구현 예정
        </p>
      </div>
    </div>
  );
}
