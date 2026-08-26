import { apiFetch } from "@/lib/api";
import { ContextRequiredState, EmptyState, PermissionDeniedState } from "@/components/states/States";
import { PERMISSIONS } from "@axora/types";

interface AuditLogRow {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: string;
  createdAt: string;
}

export default async function AuditLogPage() {
  const { status, body } = await apiFetch<AuditLogRow[]>("/audit");

  if (status === 403) {
    return <PermissionDeniedState requiredPermission={PERMISSIONS.AUDIT_VIEW} />;
  }
  if (status === 400 || status === 404) {
    return <ContextRequiredState missing="organization" />;
  }

  const rows = body ?? [];

  return (
    <div>
      <h1>Audit Log</h1>
      <p style={{ color: "var(--axora-text-secondary)", marginTop: 4, marginBottom: 20 }}>
        Append-only security and business events for the active organization. There is no
        update/delete path for this data, in the API or in the database.
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No audit events yet" description="Events appear here as soon as actions occur (login, logout, context switches, ...)." />
      ) : (
        <div className="axora-table-scroll">
          <table className="axora-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>{row.action}</td>
                  <td>
                    {row.resourceType}
                    {row.resourceId ? ` · ${row.resourceId}` : ""}
                  </td>
                  <td>{row.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
