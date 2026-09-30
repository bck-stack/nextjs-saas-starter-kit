import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { SetupNotice } from "@/components/SetupNotice";
import { PLANS } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Billing" };

const MESSAGES: Record<string, { kind: "success" | "error"; text: string }> = {
  success: { kind: "success", text: "Payment received — your subscription will be active in a few seconds." },
  canceled: { kind: "error", text: "Checkout was canceled. No charge was made." },
  error: { kind: "error", text: "Something went wrong talking to Stripe. Please try again." },
  config: { kind: "error", text: "Billing is not configured on this server yet." },
};

export default async function BillingPage({ searchParams }: { searchParams: { status?: string; plan?: string } }) {
  const { entitlement, subscription } = await requireUser();
  const notice = searchParams.status ? MESSAGES[searchParams.status] : undefined;
  const stripeReady = !!process.env.STRIPE_SECRET_KEY && Object.values(PLANS).every((p) => p.priceId);

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-white">Billing</h1>
      <p className="mb-8 text-sm text-gray-400">
        Current plan: <span className="font-semibold text-white">{entitlement.planName}</span>
      </p>

      {notice && <p className={`mb-6 ${notice.kind === "success" ? "alert-success" : "alert-error"}`}>{notice.text}</p>}
      {!stripeReady && (
        <div className="mb-6">
          <SetupNotice missing={["STRIPE_SECRET_KEY", "STRIPE_STARTER_PRICE_ID", "STRIPE_PRO_PRICE_ID"]} />
        </div>
      )}

      {entitlement.active && subscription?.stripe_customer_id ? (
        <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Manage subscription</p>
            <p className="text-sm text-gray-400">
              Change plan, update your card, download invoices or cancel in the Stripe customer portal.
            </p>
          </div>
          <form action="/api/portal" method="post">
            <SubmitButton className="btn-primary" pendingText="Opening…">Open billing portal</SubmitButton>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border p-6 ${
                searchParams.plan === plan.key || plan.highlighted ? "border-blue-500 bg-blue-950/30" : "border-gray-700 bg-gray-900"
              }`}
            >
              <h2 className="mb-1 text-lg font-bold">{plan.name}</h2>
              <p className="mb-4 text-3xl font-extrabold">
                ${plan.price}
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-green-400" /> {f}
                  </li>
                ))}
              </ul>
              <form action="/api/checkout" method="post">
                <input type="hidden" name="plan" value={plan.key} />
                <SubmitButton pendingText="Redirecting to Stripe…">Subscribe to {plan.name}</SubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}
      {entitlement.status === "past_due" && subscription?.stripe_customer_id && (
        <form action="/api/portal" method="post" className="mt-6">
          <SubmitButton className="btn-secondary" pendingText="Opening…">Update payment method</SubmitButton>
        </form>
      )}
    </>
  );
}
