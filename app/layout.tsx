import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SaaSKit — Ship your SaaS faster", template: "%s · SaaSKit" },
  description: "Next.js 14 starter with Supabase auth, Stripe subscriptions and a ready-to-go dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
