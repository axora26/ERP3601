import Link from "next/link";

export interface WorkspaceNavigatorItem {
  key: string;
  label: string;
  href: string;
  available: boolean;
  active?: boolean;
}

export function WorkspaceNavigator({
  title,
  items,
}: {
  title: string;
  items: WorkspaceNavigatorItem[];
}) {
  return (
    <nav aria-label={`${title} sections`} className="axora-workspace-nav">
      <div className="axora-workspace-nav__title">{title}</div>
      <ul className="axora-workspace-nav__list">
        {items.map((item) => (
          <li key={item.key}>
            {item.available ? (
              <Link
                href={item.href}
                className={`axora-workspace-nav__item${item.active ? " axora-workspace-nav__item--active" : ""}`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="axora-workspace-nav__item axora-workspace-nav__item--disabled"
                title={`${item.label} — not available in this build`}
                aria-disabled="true"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
