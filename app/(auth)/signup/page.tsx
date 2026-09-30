import type { Metadata } from "next";
import { signup } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";
import { isPlanKey } from "@/lib/plans";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage({ searchParams }: { searchParams: { plan?: string } }) {
  return <AuthForm mode="signup" action={signup} plan={isPlanKey(searchParams.plan) ? searchParams.plan : undefined} />;
}
