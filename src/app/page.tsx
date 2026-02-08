import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Decision Pack Platform</h1>
      <p className="mt-4 text-lg text-gray-600">
        근거가 붙은 의사결정 패키지 생성 플랫폼
      </p>
      <Link
        href="/app"
        className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Dashboard로 이동 →
      </Link>
    </main>
  );
}
