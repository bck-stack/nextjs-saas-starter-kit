import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Landing page — hero section and pricing plans.
 * Signed-in users see a Dashboard link instead of sign-up buttons.
 */
export default async function HomePage() {
  let user = null;
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    ({ data: { user } } = await supabase.auth.getUser());
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-6 py-5 sm:px-8">
        <span className="text-xl font-bold text-blue-400">⚡ SaaSKit</span>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="hidden text-sm text-gray-400 transition hover:text-white sm:inline">Pricing</a>
          {user ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-400 transition hover:text-white">Sign in</Link>
              <Link href="/signup" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
          Ship your SaaS faster
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-gray-400">
          Next.js 14 boilerplate with Supabase auth, Stripe subscriptions, and a ready-to-go dashboard.
          Clone and launch in hours, not weeks.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href={user ? "/dashboard" : "/signup"} className="btn-primary px-8 py-3 text-base">
            {user ? "Open dashboard" : "Start for free"}
          </Link>
          <a
            href="https://github.com/bck-stack/nextjs-saas-starter-kit"
            className="btn-secondary px-8 py-3 text-base"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20" id="pricing">
        <h2 className="mb-4 text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mb-12 text-center text-gray-400">No hidden fees. Cancel anytime.</p>
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border p-8 ${plan.highlighted ? "border-blue-500 bg-blue-950/30" : "border-gray-700 bg-gray-900"}`}
            >
              <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
              <div className="mb-6 text-4xl font-extrabold">
                ${plan.price}
                <span className="text-base font-normal text-gray-400">/mo</span>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="shrink-0 text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={user ? `/dashboard/billing?plan=${plan.key}` : `/signup?plan=${plan.key}`}
                className={`block rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                  plan.highlighted ? "bg-blue-500 text-white hover:bg-blue-400" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                Get {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SaaSKit. Built with Next.js, Supabase and Stripe.
      </footer>
    </main>
  );
}
