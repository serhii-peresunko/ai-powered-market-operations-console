import type { ReactNode } from "react";
import Link from "next/link";
import {
  RiBarChartBoxLine,
  RiDashboardLine,
  RiGlobalLine,
  RiSparklingLine,
} from "@remixicon/react";

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
    <div className={assistant ? "workspace with-assistant" : "workspace"}>
      <a href="#dashboard" className="skip-link">
        Skip to dashboard
      </a>
      <aside className="workspace-nav" aria-label="Workspace navigation">
        <Link href="/" className="brand" title="Market operations home">
          <span className="brand-mark">
            <RiBarChartBoxLine size={23} aria-hidden="true" />
          </span>
          <span>
            market<span className="brand-light">ops</span>
            <small>PORTFOLIO INTELLIGENCE</small>
          </span>
        </Link>
        <p className="nav-caption">WORKSPACE</p>
        <a
          href="#dashboard"
          title="Overview"
          className="nav-link active"
          aria-current="page"
        >
          <RiDashboardLine size={19} aria-hidden="true" />
          <span>Overview</span>
        </a>
        <a href="#market-detail" title="Markets" className="nav-link">
          <RiGlobalLine size={19} aria-hidden="true" />
          <span>Markets</span>
          <span className="nav-count" aria-hidden="true">
            {marketCount}
          </span>
        </a>

        {assistant && (
          <a href="#assistant" title="Assistant" className="nav-link">
            <RiSparklingLine size={19} aria-hidden="true" />
            <span>Assistant</span>
          </a>
        )}
        <div className="nav-footer">
          <span className="avatar">MO</span>
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
