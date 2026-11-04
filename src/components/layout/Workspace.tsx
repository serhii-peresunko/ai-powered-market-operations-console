import type { ReactNode } from "react";
import Link from "next/link";
import {
  RiBarChartBoxLine,
  RiDashboardLine,
  RiGlobalLine,
  RiSparklingLine,
} from "@remixicon/react";

const UI = {
  workspaceWithAssistant: "workspace with-assistant",
  workspace: "workspace",
  skipLink: "skip-link",
  workspaceNav: "workspace-nav",
  brand: "brand",
  brandMark: "brand-mark",
  brandLight: "brand-light",
  navCaption: "nav-caption",
  activeNavLink: "nav-link active",
  navLink: "nav-link",
  navCount: "nav-count",
  navFooter: "nav-footer",
  avatar: "avatar",
} as const;

export function Workspace({
  marketCount,
  assistant,
  children,
}: {
  marketCount: number;
  assistant?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={assistant ? UI.workspaceWithAssistant : UI.workspace}>
      <a href="#dashboard" className={UI.skipLink}>
        Skip to dashboard
      </a>
      <aside className={UI.workspaceNav} aria-label="Workspace navigation">
        <Link href="/" className={UI.brand} title="Market operations home">
          <span className={UI.brandMark}>
            <RiBarChartBoxLine size={23} aria-hidden="true" />
          </span>
          <span>
            market<span className={UI.brandLight}>ops</span>
            <small>PORTFOLIO INTELLIGENCE</small>
          </span>
        </Link>
        <p className={UI.navCaption}>WORKSPACE</p>
        <a
          href="#dashboard"
          title="Overview"
          className={UI.activeNavLink}
          aria-current="page"
        >
          <RiDashboardLine size={19} aria-hidden="true" />
          <span>Overview</span>
        </a>
        <a href="#market-detail" title="Markets" className={UI.navLink}>
          <RiGlobalLine size={19} aria-hidden="true" />
          <span>Markets</span>
          <span className={UI.navCount} aria-hidden="true">
            {marketCount}
          </span>
        </a>

        {assistant && (
          <a href="#assistant" title="Assistant" className={UI.navLink}>
            <RiSparklingLine size={19} aria-hidden="true" />
            <span>Assistant</span>
          </a>
        )}
        <div className={UI.navFooter}>
          <span className={UI.avatar}>MO</span>
          <div>
            Commercial operations<small>Demo workspace · USD</small>
          </div>
        </div>
      </aside>
      {children}
      {assistant}
    </div>
  );
}
