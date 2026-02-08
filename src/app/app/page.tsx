import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/app/new"
          className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          + 새 Run 생성
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">아직 생성된 Run이 없습니다.</p>
      </div>
    </div>
  );
}
