import type { ReactNode } from "react";
import Link from "next/link";
import {
  RiBarChartBoxLine,
  RiDashboardLine,
  RiGlobalLine,
  RiSparklingLine,
} from "@remixicon/react";
import { WORKSPACE_TEXT as TEXT } from "./workspace-copy";

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
  currency,
  assistant,
  children,
}: {
  marketCount: number;
  currency: string;
  assistant?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={assistant ? UI.workspaceWithAssistant : UI.workspace}>
      <a href="#dashboard" className={UI.skipLink}>
        {TEXT.skipToDashboard}
      </a>
      <aside className={UI.workspaceNav} aria-label={TEXT.workspaceNavigation}>
        <Link href="/" className={UI.brand} title={TEXT.marketOperationsHome}>
          <span className={UI.brandMark}>
            <RiBarChartBoxLine size={23} aria-hidden="true" />
          </span>
          <span>
            {TEXT.market}
            <span className={UI.brandLight}>{TEXT.ops}</span>
            <small>{TEXT.portfolioIntelligence}</small>
          </span>
        </Link>
        <p className={UI.navCaption}>{TEXT.workspace}</p>
        <a
          href="#dashboard"
          title={TEXT.overview}
          className={UI.activeNavLink}
          aria-current="page"
        >
          <RiDashboardLine size={19} aria-hidden="true" />
          <span>{TEXT.overview}</span>
        </a>
        <a href="#market-detail" title={TEXT.markets} className={UI.navLink}>
          <RiGlobalLine size={19} aria-hidden="true" />
          <span>{TEXT.markets}</span>
          <span className={UI.navCount} aria-hidden="true">
            {marketCount}
          </span>
        </a>

        {assistant && (
          <a href="#assistant" title={TEXT.assistant} className={UI.navLink}>
            <RiSparklingLine size={19} aria-hidden="true" />
            <span>{TEXT.assistant}</span>
          </a>
        )}
        <div className={UI.navFooter}>
          <span className={UI.avatar}>{TEXT.mo}</span>
          <div>
            {TEXT.commercialOperations}
            <small>{TEXT.demoWorkspace(currency)}</small>
          </div>
        </div>
      </aside>
      {children}
      {assistant}
    </div>
  );
}
