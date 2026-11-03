import type { DashboardProps } from "./types";
import { ViewControls } from "./ViewControls";
import { scopeName } from "@/lib/metrics";
import { periodLabel } from "@/lib/format";

export function DashboardHeader({ data, view, update }: DashboardProps) {
  const period = view.period;
  return (
    <>
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
          {view.region && (
            <>
              <span>/</span>
              <button
                onClick={() =>
                  update({ market: undefined, product: undefined })
                }
              >
                {data.regions.find((r) => r.id === view.region)?.name}
              </button>
            </>
          )}
          {view.market && (
            <>
              <span>/</span>
              <button onClick={() => update({ product: undefined })}>
                {data.markets.find((m) => m.id === view.market)?.name}
              </button>
            </>
          )}
          {view.product && (
            <>
              <span>/</span>
              <strong>{scopeName(data, view)}</strong>
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
            {scopeName(data, view)} overview
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
            aria-pressed={view.mode === "executive"}
            onClick={() => update({ mode: "executive" })}
          >
            Executive overview
          </button>
          <button
            aria-pressed={view.mode === "analyst"}
            onClick={() => update({ mode: "analyst" })}
          >
            Analyst deep-dive
          </button>
        </div>
        <span>
          {view.mode === "executive"
            ? "Health, trends & priorities"
            : "Full metrics & every drill path"}
        </span>
      </div>
      <ViewControls data={data} view={view} update={update} />
      {view.status !== "all" && (
        <p className="active-filter">
          Latest status filter: {view.status.replaceAll("_", " ")}{" "}
          <button
            className="text-button"
            onClick={() => update({ status: "all" })}
          >
            Clear filter
          </button>
        </p>
      )}
    </>
  );
}
