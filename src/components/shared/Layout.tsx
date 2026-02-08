import { ReactNode } from "react";
import Link from "next/link";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gray-900 p-4 text-white">
        <nav className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Decision Pack Platform
          </Link>
          <div className="space-x-4">
            <Link href="/app" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/policies" className="hover:underline">
              Policies
            </Link>
          </div>
        </nav>
      </header>
      <main className="container mx-auto flex-1 p-8">{children}</main>
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © 2026 Decision Pack Platform v0.1 (Prototype)
      </footer>
    </div>
  );
}
