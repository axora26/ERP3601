import type { SessionContextDto } from "@axora/types";
import { NavigationRail, type NavigationRailItem } from "./NavigationRail";
import { WorkspaceNavigator, type WorkspaceNavigatorItem } from "./WorkspaceNavigator";
import { IntelligenceDrawer } from "./IntelligenceDrawer";
import { ContextSwitcher } from "./ContextSwitcher";
import { LogoutButton } from "./LogoutButton";

export const PRIMARY_NAVIGATION: NavigationRailItem[] = [
  { key: "home", label: "Home", href: "/", icon: "⌂", available: true },
  { key: "commercial", label: "Commercial", href: "/commercial", icon: "⚙", available: false },
  { key: "projects", label: "Projects", href: "/projects", icon: "▦", available: false },
  { key: "operations", label: "Operations", href: "/operations", icon: "⚙", available: false },
  { key: "engineering", label: "Engineering", href: "/engineering", icon: "⚒", available: false },
  { key: "finance", label: "Finance", href: "/finance", icon: "€", available: false },
  { key: "people", label: "People", href: "/people", icon: "●", available: false },
  { key: "assets", label: "Assets", href: "/assets", icon: "▣", available: false },
  { key: "data", label: "Data", href: "/data", icon: "▤", available: false },
  { key: "administration", label: "Administration", href: "/administration", icon: "⚙", available: true },
];

export function AppShell({
  session,
  activeKey,
  workspaceTitle,
  workspaceItems,
  drawerContent,
  children,
}: {
  session: SessionContextDto;
  activeKey: string;
  workspaceTitle?: string;
  workspaceItems?: WorkspaceNavigatorItem[];
  drawerContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navItems = PRIMARY_NAVIGATION.map((item) => ({ ...item, active: item.key === activeKey }));

  return (
    <div className="axora-shell">
      <NavigationRail items={navItems} />
      <div className="axora-shell__body">
        <header className="axora-shell__top-bar">
          <ContextSwitcher session={session} />
          <div className="axora-shell__top-bar-user">
            <span>
              {session.displayName} &lt;{session.email}&gt;
            </span>
            <LogoutButton />
          </div>
        </header>
        <div className="axora-shell__workspace">
          {workspaceTitle && workspaceItems && (
            <WorkspaceNavigator title={workspaceTitle} items={workspaceItems} />
          )}
          <main id="axora-main-content" className="axora-shell__canvas" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <IntelligenceDrawer>{drawerContent ?? <DefaultDrawerContent session={session} />}</IntelligenceDrawer>
    </div>
  );
}

function DefaultDrawerContent({ session }: { session: SessionContextDto }) {
  return (
    <div>
      <h2>Session</h2>
      <dl className="axora-drawer__facts">
        <dt>User</dt>
        <dd>{session.displayName}</dd>
        <dt>Email</dt>
        <dd>{session.email}</dd>
        <dt>Active organization</dt>
        <dd>{session.activeOrganizationId ?? "None"}</dd>
        <dt>Active company</dt>
        <dd>{session.activeCompanyId ?? "None"}</dd>
      </dl>
      <p className="axora-drawer__note">Notifications, activity and AI assistant panels are not available in this build (Wave 1 scope).</p>
    </div>
  );
}
