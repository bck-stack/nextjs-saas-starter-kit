import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, CreditCard, Settings, LogOut } from "lucide-react";

/**
 * Dashboard page — protected, requires authentication.
 * Fetches user and subscription data from Supabase.
 */
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .single();

  const isActive = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-lg font-bold text-blue-400">⚡ SaaSKit</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
            { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
            { icon: Settings, label: "Settings", href: "/dashboard/settings" },
          ].map(({ icon: Icon, label, href }) => (
            <a key={label} href={href}
               className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition">
              <Icon size={16} />
              {label}
            </a>
          ))}
        </nav>
        <div className="px-4 pb-6">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 text-sm transition">
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 text-sm mb-8">Welcome back, {user.email}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Plan", value: isActive ? "Pro" : "Free", color: isActive ? "text-blue-400" : "text-gray-400" },
              { label: "Status", value: isActive ? "Active" : "Inactive", color: isActive ? "text-green-400" : "text-yellow-400" },
              {
                label: "Renewal",
                value: subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : "—",
                color: "text-white"
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Upgrade CTA */}
          {!isActive && (
            <div className="bg-blue-950/40 border border-blue-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white mb-1">Upgrade to Pro</p>
                <p className="text-sm text-gray-400">Unlock all features — $29/month</p>
              </div>
              <a href="/dashboard/billing"
                 className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition">
                Upgrade now
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
