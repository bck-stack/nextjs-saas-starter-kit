import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { ProfileForms } from "./ProfileForms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: { reset?: string } }) {
  const { user } = await requireUser();
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-white">Settings</h1>
      <p className="mb-8 text-sm text-gray-400">Signed in as {user.email}</p>
      {searchParams.reset && <p className="alert-success mb-6">You can now choose a new password below.</p>}
      <ProfileForms fullName={(user.user_metadata?.full_name as string | undefined) ?? ""} />
    </>
  );
}
