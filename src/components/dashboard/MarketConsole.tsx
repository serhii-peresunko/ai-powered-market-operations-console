"use client";

import { RiBarChartBoxLine, RiDashboardLine, RiSparklingLine, RiGlobalLine, RiArrowRightUpLine } from "@remixicon/react";
import { Card } from "@/components/Card";
import Link from "next/link";
import type { Dataset, Status } from "@/data/types";
import { marketsInScope, metricsFor, scopeName, type Scope } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";

export const statusLabels: Record<Status, string> = { on_track: "On track", at_risk: "At risk", off_track: "Off track" };

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge ${status}`}><span aria-hidden="true">{status === "on_track" ? "✓" : "!"}</span>{statusLabels[status]}</span>;
}

export function MarketConsole({ data }: { data: Dataset }) {
  const scope: Scope = {};
  const period = data.meta.latestPeriod;
  const metrics = metricsFor(data, scope, period);
  const markets = marketsInScope(data, scope);
  const risks = markets.filter((market) => market.kpis.status !== "on_track");
  const movers = markets.map((market) => ({ market, ...metricsFor(data, { market: market.id }, period) }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap)).slice(0, 4);

  return <div className="workspace">
    <a href="#dashboard" className="skip-link">Skip to dashboard</a>
    <aside className="workspace-nav" aria-label="Workspace navigation">
      <Link href="/" className="brand"><span className="brand-mark"><RiBarChartBoxLine size={23} aria-hidden="true" /></span><span>market<span className="brand-light">ops</span><small>PORTFOLIO INTELLIGENCE</small></span></Link>
      <p className="nav-caption">WORKSPACE</p>
      <a href="#dashboard" className="nav-link active" aria-current="page"><RiDashboardLine size={19} aria-hidden="true" /><span>Overview</span></a>
      <a href="#market-detail" className="nav-link"><RiGlobalLine size={19} aria-hidden="true" /><span>Markets</span><span className="nav-count">{data.markets.length}</span></a>
      <a href="#assistant" className="nav-link"><RiSparklingLine size={19} aria-hidden="true" /><span>Assistant</span></a>
      <div className="nav-footer"><span className="avatar">MO</span><div>Commercial operations<small>Demo workspace · USD</small></div></div>
    </aside>
    <main id="dashboard" className="dashboard-main">
      <div className="topbar"><span>Workspace <span aria-hidden="true">/</span> <strong>Overview</strong></span><span className="source-pill"><span aria-hidden="true">●</span> Canonical dataset</span></div>
      <header className="page-heading"><div><p className="eyebrow">YOUR PORTFOLIO, IN FOCUS</p><h1>{scopeName(data, scope)} overview</h1><p className="secondary-text">The signals that matter. The context to act.</p></div><div className="period-stamp"><span>REPORTING PERIOD</span><strong>{periodLabel(period)}</strong></div></header>
      <div className="source-note"><span className="source-dot" aria-hidden="true" />Source data · {periodLabel(period)} · All revenue in {data.meta.currency}<span className="source-note-end">Synthetic assignment dataset</span></div>
      <section className="kpi-grid" aria-label="Portfolio health">
        <Card className="metric-card"><p>Total revenue</p><strong>{money(metrics.actual, data.meta.currency)}</strong><span className={metrics.growth !== null && metrics.growth >= 0 ? "positive" : "negative"}>{percent(metrics.growth, true)} <span className="metric-context">vs prior year</span></span></Card>
        <Card className="metric-card"><p>Forecast attainment</p><strong>{percent(metrics.attainment)}</strong><span className={metrics.gap >= 0 ? "positive" : "negative"}>{money(metrics.gap, data.meta.currency)} <span className="metric-context">vs plan</span></span></Card>
        <Card className="metric-card"><p>Year-on-year growth</p><strong>{percent(metrics.growth, true)}</strong><span className="metric-context">Same period, prior year</span></Card>
        <Card className="metric-card"><p>Markets to watch</p><strong>{risks.length}<small> / {markets.length}</small></strong><span className="metric-context">Latest source status · {periodLabel(data.meta.latestPeriod)}</span></Card>
      </section>
      <div className="dashboard-grid">
        <Card id="market-detail" className="panel"><div className="panel-heading"><div><p className="eyebrow">PRIORITIZE</p><h2>Markets to watch</h2></div><span className="count-chip">{risks.length} markets</span></div><p className="panel-description">Latest source flags, including off-track markets.</p><div className="risk-list">{risks.map((market) => <div key={market.id} className="risk-row"><span className="country-code">{market.iso2}</span><div className="risk-name"><strong>{market.name}</strong><span>{data.regions.find((region) => region.id === market.regionId)?.name}</span></div><StatusBadge status={market.kpis.status} /></div>)}</div></Card>
        <Card className="panel"><div className="panel-heading"><div><p className="eyebrow">WHAT MOVED THE NEEDLE</p><h2>Largest forecast gaps</h2></div><RiArrowRightUpLine size={20} aria-hidden="true" /></div><p className="panel-description">Ranked by absolute revenue variance from plan.</p><div className="movers-list">{movers.map(({ market, gap, attainment }) => <div key={market.id} className="mover-row"><div><strong>{market.name}</strong><span>{percent(attainment)} of forecast</span></div><strong className={gap >= 0 ? "positive" : "negative"}>{gap > 0 ? "+" : ""}{money(gap, data.meta.currency)}</strong></div>)}</div><div className="insight-note"><RiSparklingLine size={17} aria-hidden="true" /><span>Have a question about a market? Explore the evidence with the assistant.</span></div></Card>
      </div>
      <footer className="dashboard-footer">Source of truth: canonical dataset <span>Generated {data.meta.generatedAt}</span></footer>
    </main>
    <aside id="assistant" className="assistant-panel" aria-labelledby="assistant-title"><header className="assistant-heading"><span className="assistant-symbol"><RiSparklingLine size={21} aria-hidden="true" /></span><div><h2 id="assistant-title">Market assistant</h2><p>AI-generated interpretation</p></div><span className="demo-badge">DEMO</span></header><div className="assistant-empty"><span className="welcome-symbol"><RiSparklingLine size={30} aria-hidden="true" /></span><h3>From numbers<br />to understanding.</h3><p>Ask a question about your portfolio.<br />Follow the evidence behind every answer.</p></div><div className="assistant-footnote">Fixture-based assistant · No live model</div></aside>
  </div>;
}
