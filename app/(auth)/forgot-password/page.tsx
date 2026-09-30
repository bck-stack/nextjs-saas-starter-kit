import type { Metadata } from "next";
import { requestPasswordReset } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <AuthForm mode="reset" action={requestPasswordReset} />;
}
