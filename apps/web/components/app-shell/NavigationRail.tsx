import Link from "next/link";

export interface NavigationRailItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  available: boolean;
  active?: boolean;
}

export function NavigationRail({ items }: { items: NavigationRailItem[] }) {
  return (
    <nav aria-label="Primary" className="axora-nav-rail">
      <div className="axora-nav-rail__brand" aria-hidden="true">
        A1
      </div>
      <ul className="axora-nav-rail__list">
        {items.map((item) => (
          <li key={item.key}>
            {item.available ? (
              <Link
                href={item.href}
                className={`axora-nav-rail__item${item.active ? " axora-nav-rail__item--active" : ""}`}
              >
                <span className="axora-nav-rail__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="axora-nav-rail__label">{item.label}</span>
              </Link>
            ) : (
              <span
                className="axora-nav-rail__item axora-nav-rail__item--disabled"
                title={`${item.label} — not available in this build`}
                aria-disabled="true"
              >
                <span className="axora-nav-rail__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="axora-nav-rail__label">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
