/**
 * Distinct components for distinct states (mission Section 39). Never
 * collapse "no data", "no permission", "no context", and "error" into one
 * generic message.
 */

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="axora-state axora-state--empty" role="status">
      <p className="axora-state__title">{title}</p>
      {description && <p className="axora-state__description">{description}</p>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="axora-state axora-state--loading" role="status" aria-live="polite">
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description }: { title?: string; description?: string }) {
  return (
    <div className="axora-state axora-state--error" role="alert">
      <p className="axora-state__title">{title}</p>
      {description && <p className="axora-state__description">{description}</p>}
    </div>
  );
}

export function PermissionDeniedState({ requiredPermission }: { requiredPermission?: string }) {
  return (
    <div className="axora-state axora-state--permission" role="alert">
      <p className="axora-state__title">You don&rsquo;t have permission to view this</p>
      {requiredPermission && (
        <p className="axora-state__description">Requires permission: {requiredPermission}</p>
      )}
    </div>
  );
}

export function ContextRequiredState({ missing }: { missing: "organization" | "company" }) {
  return (
    <div className="axora-state axora-state--context" role="status">
      <p className="axora-state__title">
        {missing === "organization" ? "Select an organization to continue" : "Select a company to continue"}
      </p>
      <p className="axora-state__description">Use the context switcher at the top of the screen.</p>
    </div>
  );
}

export function PrerequisiteState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="axora-state axora-state--prerequisite" role="status">
      <p className="axora-state__title">{title}</p>
      {description && <p className="axora-state__description">{description}</p>}
    </div>
  );
}
