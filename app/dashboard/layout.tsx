import Link from "next/link";
import { LogOut } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { SetupNotice } from "@/components/SetupNotice";
import { requireUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <SetupNotice missing={["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]} />
      </main>
    );
  }
  const { user } = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 md:flex-row">
      {/* Sidebar */}
      <aside className="flex flex-col border-b border-gray-800 bg-gray-900 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5">
          <Link href="/" className="text-lg font-bold text-blue-400">⚡ SaaSKit</Link>
        </div>
        <DashboardNav />
        <div className="hidden px-4 pb-6 md:block">
          <p className="mb-2 truncate px-3 text-xs text-gray-500" title={user.email}>{user.email}</p>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-red-400">
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl">{children}</div>
        <form action="/auth/signout" method="post" className="mt-10 md:hidden">
          <button className="btn-secondary w-full"><LogOut size={16} /> Sign out</button>
        </form>
      </main>
    </div>
  );
}
