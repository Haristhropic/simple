"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AdminProfilePage() {
  const { data: session } = authClient.useSession();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("password") as string;

    if (!newPassword) return;

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    const { error: apiError } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    if (apiError) {
      setError(apiError.message || "Failed to change password.");
    } else {
      form.reset();
      setSuccess("Password changed successfully.");
    }
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tighter">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings.</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">{success}</div>
      )}
      <div className="flex items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-medium">
          {session.user.name?.charAt(0) || "A"}
        </div>
        <div>
          <p className="font-medium">{session.user.name || "User"}</p>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" type="text" defaultValue={session.user.name || ""} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" type="email" defaultValue={session.user.email} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
          <input id="currentPassword" name="currentPassword" type="password" required
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">New Password</label>
          <input id="password" name="password" type="password" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="Leave blank to keep current" />
        </div>
        <button type="submit" className="inline-flex h-10 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90">Save Changes</button>
      </form>
    </div>
  );
}
