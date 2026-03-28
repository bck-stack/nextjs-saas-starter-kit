import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";
import { Check } from "lucide-react";

/**
 * Landing page — shows hero section and pricing plans.
 * Redirects authenticated users to dashboard.
 */
export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span className="text-xl font-bold text-blue-400">⚡ SaaSKit</span>
        <div className="flex gap-4 items-center">
          {user ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">Sign in</Link>
              <Link href="/signup" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Ship your SaaS faster
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Next.js 14 boilerplate with Supabase auth, Stripe subscriptions, and a ready-to-go dashboard.
          Clone and launch in hours, not weeks.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">Start for free</Link>
          <a href="https://github.com/bck-stack/nextjs-saas-boilerplate"
             className="btn-secondary px-8 py-3 text-base" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6" id="pricing">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-gray-400 text-center mb-12">No hidden fees. Cancel anytime.</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {Object.values(PLANS).map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 border ${
              plan.name === "Pro"
                ? "border-blue-500 bg-blue-950/30"
                : "border-gray-700 bg-gray-900"
            }`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-extrabold mb-6">
                ${plan.price}<span className="text-base font-normal text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={user ? "/dashboard/billing" : "/signup"}
                    className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition ${
                      plan.name === "Pro"
                        ? "bg-blue-500 hover:bg-blue-400 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}>
                Get {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
