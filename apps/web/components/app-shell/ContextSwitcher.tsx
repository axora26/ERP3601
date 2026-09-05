"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SessionContextDto } from "@axora/types";

export function ContextSwitcher({ session }: { session: SessionContextDto }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activeOrg = session.organizations.find((o) => o.id === session.activeOrganizationId) ?? session.organizations[0];

  async function switchContext(organizationId: string, companyId: string | null): Promise<void> {
    setError(null);
    const response = await fetch("/api/v1/auth/switch-context", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationId, companyId }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(body?.message ?? "Unable to switch context");
      return;
    }
    startTransition(() => router.refresh());
  }

  if (session.organizations.length === 0) {
    return <span className="axora-context-switcher__empty">No organization membership</span>;
  }

  return (
    <div className="axora-context-switcher">
      <label>
        <span className="axora-context-switcher__label">Organization</span>
        <select
          value={activeOrg?.id ?? ""}
          disabled={isPending}
          onChange={(e) => {
            const org = session.organizations.find((o) => o.id === e.target.value);
            void switchContext(e.target.value, org?.companies[0]?.id ?? null);
          }}
        >
          {session.organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="axora-context-switcher__label">Company</span>
        <select
          value={session.activeCompanyId ?? ""}
          disabled={isPending || !activeOrg || activeOrg.companies.length === 0}
          onChange={(e) => {
            if (activeOrg) {
              void switchContext(activeOrg.id, e.target.value || null);
            }
          }}
        >
          {(activeOrg?.companies ?? []).map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <span role="alert" className="axora-context-switcher__error">
          {error}
        </span>
      )}
    </div>
  );
}
