"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout(): Promise<void> {
    setPending(true);
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className="axora-logout-button" onClick={() => void handleLogout()} disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
