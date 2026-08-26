import { redirect } from "next/navigation";
import { apiFetch, getSessionContext } from "@/lib/api";
import { AppShell } from "@/components/app-shell/AppShell";
import { ContextRequiredState, EmptyState, PermissionDeniedState } from "@/components/states/States";
import { PERMISSIONS } from "@axora/types";

interface Company {
  id: string;
  code: string;
  name: string;
}

export default async function HomePage() {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }

  let companies: Company[] = [];
  let companiesPermissionDenied = false;
  if (session.activeOrganizationId) {
    const result = await apiFetch<Company[]>("/companies");
    if (result.status === 403) {
      companiesPermissionDenied = true;
    } else if (result.status === 200 && Array.isArray(result.body)) {
      companies = result.body;
    }
  }

  return (
    <AppShell session={session} activeKey="home">
      <h1>Command Center</h1>
      <p style={{ color: "var(--axora-text-secondary)", marginTop: 4 }}>
        Foundation slice — organization, company and access data below is real. Business-domain
        KPIs (revenue, budgets, forecasts) will appear once the corresponding wave is built; this
        build deliberately shows none rather than fabricate them.
      </p>

      {!session.activeOrganizationId ? (
        <div style={{ marginTop: 24 }}>
          <ContextRequiredState missing="organization" />
        </div>
      ) : (
        <>
          <div className="axora-metric-group" style={{ marginTop: 24 }}>
            <div className="axora-metric">
              <div className="axora-metric__label">Organizations</div>
              <div className="axora-metric__value">{session.organizations.length}</div>
            </div>
            <div className="axora-metric">
              <div className="axora-metric__label">Companies in active organization</div>
              <div className="axora-metric__value">{companiesPermissionDenied ? "—" : companies.length}</div>
            </div>
          </div>

          <h2 style={{ marginTop: 32, marginBottom: 12 }}>Companies</h2>
          {companiesPermissionDenied ? (
            <PermissionDeniedState requiredPermission={PERMISSIONS.COMPANY_VIEW} />
          ) : companies.length === 0 ? (
            <EmptyState
              title="No companies in this organization yet"
              description="Companies are created by an administrator; none exist for this demo organization slice yet."
            />
          ) : (
            <div className="axora-table-scroll">
              <table className="axora-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>{company.code}</td>
                      <td>{company.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
