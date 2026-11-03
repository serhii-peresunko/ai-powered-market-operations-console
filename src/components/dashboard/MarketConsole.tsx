"use client";

import {
  RiBarChartBoxLine,
  RiDashboardLine,
  RiSparklingLine,
  RiGlobalLine,
  RiArrowRightUpLine,
} from "@remixicon/react";
import { Card } from "@/components/Card";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Assistant } from "@/components/chat/Assistant";
import type { Dataset } from "@/data/types";
import { StatusBadge } from "./StatusBadge";
import { MarketTable } from "./MarketTable";
import { marketsInScope, metricsFor, scopeName } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";
import { useDashboardView } from "./useDashboardView";
import { ViewControls } from "./ViewControls";

const RevenueTrend = dynamic(() => import("@/components/charts/RevenueTrend"), {
  ssr: false,
  loading: () => (
    <div className="chart-loading" role="status">
      Loading revenue chart…
    </div>
  ),
});
const MarketMap = dynamic(() => import("@/components/charts/MarketMap"), {
  ssr: false,
  loading: () => (
    <div className="chart-loading" role="status">
      Loading country map…
    </div>
  ),
});
const ComparisonRadar = dynamic(
  () => import("@/components/charts/ComparisonRadar"),
  {
    ssr: false,
    loading: () => (
      <div className="chart-loading" role="status">
        Loading comparison chart…
      </div>
    ),
  },
);
const PerformanceHeatmap = dynamic(
  () => import("@/components/charts/PerformanceHeatmap"),
  {
    ssr: false,
    loading: () => (
      <div className="chart-loading" role="status">
        Loading heat map…
      </div>
    ),
  },
);
const AlertConfigurator = dynamic(
  () => import("@/components/alerts/AlertConfigurator"),
  { ssr: false },
);

export function MarketConsole({ data }: { data: Dataset }) {
  const { view: scope, update } = useDashboardView(data);
  const period = scope.period;
  const metrics = metricsFor(data, scope, period);
  const markets = marketsInScope(data, scope).filter(
    (market) => scope.status === "all" || market.kpis.status === scope.status,
  );
  const risks = markets.filter((market) => market.kpis.status !== "on_track");
  const movers = markets
    .map((market) => ({
      market,
      ...metricsFor(
        data,
        { market: market.id, product: scope.product },
        period,
      ),
    }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 4);

  return (
    <div className="workspace with-assistant">
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
            {data.markets.length}
          </span>
        </a>
        <a href="#assistant" title="Assistant" className="nav-link">
          <RiSparklingLine size={19} aria-hidden="true" />
          <span>Assistant</span>
        </a>
        <div className="nav-footer">
          <span className="avatar">MO</span>
          <div>
            Commercial operations<small>Demo workspace · USD</small>
          </div>
        </div>
      </aside>
      <main id="dashboard" tabIndex={-1} className="dashboard-main">
        <div className="topbar">
          <nav aria-label="Drill path" className="breadcrumbs">
            <button
              onClick={() =>
                update({
                  region: undefined,
                  market: undefined,
                  product: undefined,
                })
              }
            >
              Portfolio
            </button>
            {scope.region && (
              <>
                <span>/</span>
                <button
                  onClick={() =>
                    update({ market: undefined, product: undefined })
                  }
                >
                  {data.regions.find((r) => r.id === scope.region)?.name}
                </button>
              </>
            )}
            {scope.market && (
              <>
                <span>/</span>
                <button onClick={() => update({ product: undefined })}>
                  {data.markets.find((m) => m.id === scope.market)?.name}
                </button>
              </>
            )}
            {scope.product && (
              <>
                <span>/</span>
                <strong>{scopeName(data, scope)}</strong>
              </>
            )}
          </nav>
          <span className="source-pill">
            <span aria-hidden="true">●</span> Canonical dataset
          </span>
        </div>
        <header className="page-heading">
          <div>
            <p className="eyebrow">YOUR PORTFOLIO, IN FOCUS</p>
            <h1 id="dashboard-heading" tabIndex={-1}>
              {scopeName(data, scope)} overview
            </h1>
            <p className="secondary-text">
              The signals that matter. The context to act.
            </p>
          </div>
          <div className="period-stamp">
            <span>REPORTING PERIOD</span>
            <strong>{periodLabel(period)}</strong>
          </div>
        </header>
        <div className="source-note">
          <span className="source-dot" aria-hidden="true" />
          Source data · {periodLabel(period)} · All revenue in{" "}
          {data.meta.currency}
          <span className="source-note-end">Synthetic assignment dataset</span>
        </div>
        <div className="audience-toolbar">
          <div className="mode-switch" role="group" aria-label="Audience view">
            <button
              aria-pressed={scope.mode === "executive"}
              onClick={() => update({ mode: "executive" })}
            >
              Executive overview
            </button>
            <button
              aria-pressed={scope.mode === "analyst"}
              onClick={() => update({ mode: "analyst" })}
            >
              Analyst deep-dive
            </button>
          </div>
          <span>
            {scope.mode === "executive"
              ? "Health, trends & priorities"
              : "Full metrics & every drill path"}
          </span>
        </div>
        <ViewControls data={data} view={scope} update={update} />
        {scope.status !== "all" && (
          <p className="active-filter">
            Latest status filter: {scope.status.replaceAll("_", " ")}{" "}
            <button
              className="text-button"
              onClick={() => update({ status: "all" })}
            >
              Clear filter
            </button>
          </p>
        )}
        <section className="kpi-grid" aria-label="Selected scope health">
          <Card className="metric-card">
            <p>Total revenue</p>
            <strong>{money(metrics.actual, data.meta.currency)}</strong>
            <span
              className={
                metrics.growth !== null && metrics.growth >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {percent(metrics.growth, true)}{" "}
              <span className="metric-context">vs prior year</span>
            </span>
          </Card>
          <Card className="metric-card">
            <p>Forecast attainment</p>
            <strong>{percent(metrics.attainment)}</strong>
            <span className={metrics.gap >= 0 ? "positive" : "negative"}>
              {money(metrics.gap, data.meta.currency)}{" "}
              <span className="metric-context">vs plan</span>
            </span>
          </Card>
          <Card className="metric-card">
            <p>Year-on-year growth</p>
            <strong>{percent(metrics.growth, true)}</strong>
            <span className="metric-context">Same period, prior year</span>
          </Card>
          <Card className="metric-card">
            <p>Markets to watch</p>
            <strong>
              {risks.length}
              <small> / {markets.length}</small>
            </strong>
            <span className="metric-context">
              Latest source status · {periodLabel(data.meta.latestPeriod)}
            </span>
          </Card>
        </section>
        {scope.market && (
          <div className="source-detail">
            <strong>
              Source notes ·{" "}
              {data.markets.find((m) => m.id === scope.market)?.name}
            </strong>
            <p>
              {data.markets
                .find((m) => m.id === scope.market)
                ?.kpis.anomalies.map(
                  (a) => `${periodLabel(a.period)}: ${a.note}`,
                )
                .join(" ") || "No anomalies marked in the supplied data."}{" "}
              These are market-level notes; latest status is dated{" "}
              {periodLabel(data.meta.latestPeriod)}.
            </p>
          </div>
        )}
        <div className="dashboard-grid">
          <RevenueTrend
            data={data}
            view={scope}
            onPeriod={(period) => update({ period })}
          />
          {scope.mode === "analyst" && (
            <>
              <MarketMap data={data} view={scope} update={update} />
              <ComparisonRadar data={data} view={scope} update={update} />
              <PerformanceHeatmap data={data} view={scope} update={update} />
              <MarketTable data={data} view={scope} update={update} />
            </>
          )}
          <Card id="market-detail" className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PRIORITIZE</p>
                <h2>Markets to watch</h2>
              </div>
              <span className="count-chip">{risks.length} markets</span>
            </div>
            <p className="panel-description">
              Latest source flags, including off-track markets.
            </p>
            <div className="risk-list">
              {risks.length === 0 && (
                <p className="empty-panel">
                  No source-flagged markets in this scope.
                </p>
              )}
              {risks.map((market) => (
                <div key={market.id} className="risk-row">
                  <span className="country-code">{market.iso2}</span>
                  <button
                    className="risk-name"
                    onClick={() =>
                      update({
                        region: market.regionId,
                        market: market.id,
                        product: undefined,
                      })
                    }
                  >
                    <strong>{market.name}</strong>
                    <span>
                      {
                        data.regions.find(
                          (region) => region.id === market.regionId,
                        )?.name
                      }
                    </span>
                  </button>
                  <StatusBadge status={market.kpis.status} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">WHAT MOVED THE NEEDLE</p>
                <h2>Largest forecast gaps</h2>
              </div>
              <RiArrowRightUpLine size={20} aria-hidden="true" />
            </div>
            <p className="panel-description">
              Ranked by absolute revenue variance from plan.
            </p>
            <div className="movers-list">
              {movers.map(({ market, gap, attainment }) => (
                <div key={market.id} className="mover-row">
                  <button
                    className="market-link"
                    onClick={() =>
                      update({
                        region: market.regionId,
                        market: market.id,
                        product: undefined,
                      })
                    }
                  >
                    <strong>{market.name}</strong>
                    <span>{percent(attainment)} of forecast</span>
                  </button>
                  <strong className={gap >= 0 ? "positive" : "negative"}>
                    {gap > 0 ? "+" : ""}
                    {money(gap, data.meta.currency)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="insight-note">
              <RiSparklingLine size={17} aria-hidden="true" />
              <span>
                Have a question about a market? Explore the evidence with the
                assistant.
              </span>
            </div>
          </Card>
        </div>
        <AlertConfigurator data={data} period={period} />
        <footer className="dashboard-footer">
          Source of truth: canonical dataset{" "}
          <span>Generated {data.meta.generatedAt}</span>
        </footer>
      </main>
      <Assistant
        data={data}
        view={scope}
        onNavigate={(target) => {
          update(target);
          requestAnimationFrame(() => {
            document.getElementById("dashboard-heading")?.focus();
            document
              .getElementById("dashboard")
              ?.scrollIntoView({ block: "start" });
          });
        }}
      />
    </div>
  );
}
