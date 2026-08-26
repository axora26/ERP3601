import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/api";
import { AppShell } from "@/components/app-shell/AppShell";
import type { WorkspaceNavigatorItem } from "@/components/app-shell/WorkspaceNavigator";

export default async function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }

  const workspaceItems: WorkspaceNavigatorItem[] = [
    { key: "audit", label: "Audit Log", href: "/administration/audit", available: true },
    { key: "companies", label: "Companies", href: "/administration/companies", available: true },
    { key: "roles", label: "Roles & Permissions", href: "/administration/roles", available: false },
  ];

  return (
    <AppShell session={session} activeKey="administration" workspaceTitle="ADMINISTRATION" workspaceItems={workspaceItems}>
      {children}
    </AppShell>
  );
}
