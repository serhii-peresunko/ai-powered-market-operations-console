import type { DashboardProps } from "./types";
import { ViewControls } from "./ViewControls";
import { scopeName, ALL_STATUSES } from "@/lib/metrics";
import { periodLabel } from "@/lib/format";
import { DASHBOARD_MODE } from "@/lib/view";

const UI = {
  topbar: "topbar",
  breadcrumbs: "breadcrumbs",
  sourcePill: "source-pill",
  pageHeading: "page-heading",
  eyebrow: "eyebrow",
  secondaryText: "secondary-text",
  periodStamp: "period-stamp",
  sourceNote: "source-note",
  sourceDot: "source-dot",
  sourceNoteEnd: "source-note-end",
  audienceToolbar: "audience-toolbar",
  modeSwitch: "mode-switch",
  activeFilter: "active-filter",
  textButton: "text-button",
} as const;

export function DashboardHeader({ data, view, update }: DashboardProps) {
  const period = view.period;
  return (
    <>
      <div className={UI.topbar}>
        <nav aria-label="Drill path" className={UI.breadcrumbs}>
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
        <span className={UI.sourcePill}>
          <span aria-hidden="true">●</span> Canonical dataset
        </span>
      </div>
      <header className={UI.pageHeading}>
        <div>
          <p className={UI.eyebrow}>YOUR PORTFOLIO, IN FOCUS</p>
          <h1 id="dashboard-heading" tabIndex={-1}>
            {scopeName(data, view)} overview
          </h1>
          <p className={UI.secondaryText}>
            The signals that matter. The context to act.
          </p>
        </div>
        <div className={UI.periodStamp}>
          <span>REPORTING PERIOD</span>
          <strong>{periodLabel(period)}</strong>
        </div>
      </header>
      <div className={UI.sourceNote}>
        <span className={UI.sourceDot} aria-hidden="true" />
        Source data · {periodLabel(period)} · All revenue in{" "}
        {data.meta.currency}
        <span className={UI.sourceNoteEnd}>Synthetic assignment dataset</span>
      </div>
      <div className={UI.audienceToolbar}>
        <div className={UI.modeSwitch} role="group" aria-label="Audience view">
          <button
            aria-pressed={view.mode === DASHBOARD_MODE.EXECUTIVE}
            onClick={() => update({ mode: DASHBOARD_MODE.EXECUTIVE })}
          >
            Executive overview
          </button>
          <button
            aria-pressed={view.mode === DASHBOARD_MODE.ANALYST}
            onClick={() => update({ mode: DASHBOARD_MODE.ANALYST })}
          >
            Analyst deep-dive
          </button>
        </div>
        <span>
          {view.mode === DASHBOARD_MODE.EXECUTIVE
            ? "Health, trends & priorities"
            : "Full metrics & every drill path"}
        </span>
      </div>
      <ViewControls data={data} view={view} update={update} />
      {view.status !== ALL_STATUSES && (
        <p className={UI.activeFilter}>
          Latest status filter: {view.status.replaceAll("_", " ")}{" "}
          <button
            className={UI.textButton}
            onClick={() => update({ status: ALL_STATUSES })}
          >
            Clear filter
          </button>
        </p>
      )}
    </>
  );
}
