import { apiFetch } from "@/lib/api";
import { ContextRequiredState, EmptyState, PermissionDeniedState } from "@/components/states/States";
import { PERMISSIONS } from "@axora/types";

interface Company {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export default async function CompaniesAdminPage() {
  const { status, body } = await apiFetch<Company[]>("/companies");

  if (status === 403) {
    return <PermissionDeniedState requiredPermission={PERMISSIONS.COMPANY_VIEW} />;
  }
  if (status === 400 || status === 404) {
    return <ContextRequiredState missing="organization" />;
  }

  const companies = body ?? [];

  return (
    <div>
      <h1>Companies</h1>
      <p style={{ color: "var(--axora-text-secondary)", marginTop: 4, marginBottom: 20 }}>
        Companies in the active organization. Company creation/editing is not part of the Wave 1
        Foundation slice.
      </p>
      {companies.length === 0 ? (
        <EmptyState title="No companies" />
      ) : (
        <div className="axora-table-scroll">
          <table className="axora-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.code}</td>
                  <td>{company.name}</td>
                  <td>{company.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
