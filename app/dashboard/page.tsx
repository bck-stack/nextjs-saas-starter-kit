import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

/** Dashboard overview — protected by middleware and the dashboard layout. */
export default async function DashboardPage() {
  const { user, entitlement } = await requireUser();
  const name = (user.user_metadata?.full_name as string | undefined) || user.email;

  const statusLabel = entitlement.active
    ? entitlement.cancelsAtPeriodEnd || entitlement.status === "canceled"
      ? "Canceling"
      : entitlement.status === "trialing"
        ? "Trial"
        : "Active"
    : entitlement.status === "past_due"
      ? "Payment due"
      : "Inactive";

  const stats = [
    { label: "Plan", value: entitlement.planName, color: entitlement.active ? "text-blue-400" : "text-gray-400" },
    { label: "Status", value: statusLabel, color: entitlement.active ? "text-green-400" : "text-yellow-400" },
    {
      label: entitlement.cancelsAtPeriodEnd || entitlement.status === "canceled" ? "Access until" : "Renewal",
      value: entitlement.active && entitlement.renewsOn ? new Date(entitlement.renewsOn).toLocaleDateString() : "—",
      color: "text-white",
    },
  ];

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-white">Dashboard</h1>
      <p className="mb-8 text-sm text-gray-400">Welcome back, {name}</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {entitlement.status === "past_due" && (
        <div className="alert-error mb-6">
          Your last payment failed. <Link href="/dashboard/billing" className="underline">Update your payment method</Link> to keep access.
        </div>
      )}

      {!entitlement.active && (
        <div className="flex flex-col gap-4 rounded-xl border border-blue-800 bg-blue-950/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 font-semibold text-white">Upgrade to {PLANS.PRO.name}</p>
            <p className="text-sm text-gray-400">Unlock all features — ${PLANS.PRO.price}/month</p>
          </div>
          <Link href="/dashboard/billing?plan=PRO" className="btn-primary">Upgrade now</Link>
        </div>
      )}
    </>
  );
}
