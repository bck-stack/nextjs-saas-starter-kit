import type { Metadata } from "next";
import { login } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";
import { safeRedirectPath } from "@/lib/plans";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <div className="w-full max-w-sm">
      {searchParams.error && (
        <p className="alert-error mb-4" role="alert">
          {searchParams.error === "auth" ? "That sign-in link is invalid or has expired." : searchParams.error}
        </p>
      )}
      <AuthForm mode="login" action={login} next={safeRedirectPath(searchParams.next)} />
    </div>
  );
}
