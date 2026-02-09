interface PaymentPageProps {
  params: Promise<{ runId: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { runId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">결제 (Stub)</h1>
      <div className="rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Run ID: {runId}</p>
        <p className="mt-4 text-gray-500">
          v0.1에서는 결제 기능이 Stub으로 처리됩니다.
        </p>
        <button className="mt-4 rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700">
          결제 확인 (Stub)
        </button>
      </div>
    </div>
  );
}
