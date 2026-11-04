import { type DashboardProps } from "./types";
import { ViewControls } from "./ViewControls";
import { scopeName } from "@/shared/lib/metrics";
import { ALL_STATUSES, DASHBOARD_MODE } from "@/shared/types";
import { periodLabel } from "@/shared/lib/format";
import { STATUS_LABELS, DASHBOARD_HEADER_TEXT as TEXT } from "./copy";

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
        <nav aria-label={TEXT.drillPath} className={UI.breadcrumbs}>
          <button
            onClick={() =>
              update({
                region: undefined,
                market: undefined,
                product: undefined,
              })
            }
          >
            {TEXT.portfolio}
          </button>
          {view.region && (
            <>
              <span>{TEXT.breadcrumbSeparator}</span>
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
              <span>{TEXT.breadcrumbSeparator}</span>
              <button onClick={() => update({ product: undefined })}>
                {data.markets.find((m) => m.id === view.market)?.name}
              </button>
            </>
          )}
          {view.product && (
            <>
              <span>{TEXT.breadcrumbSeparator}</span>
              <strong>{scopeName(data, view)}</strong>
            </>
          )}
        </nav>
        <span className={UI.sourcePill}>
          <span aria-hidden="true">{TEXT.sourceIcon}</span>{" "}
          {TEXT.canonicalDataset}
        </span>
      </div>
      <header className={UI.pageHeading}>
        <div>
          <p className={UI.eyebrow}>{TEXT.eyebrow}</p>
          <h1 id="dashboard-heading" tabIndex={-1}>
            {TEXT.title(scopeName(data, view))}
          </h1>
          <p className={UI.secondaryText}>{TEXT.description}</p>
        </div>
        <div className={UI.periodStamp}>
          <span>{TEXT.reportingPeriod}</span>
          <strong>{periodLabel(period)}</strong>
        </div>
      </header>
      <div className={UI.sourceNote}>
        <span className={UI.sourceDot} aria-hidden="true" />
        {TEXT.sourceNote(periodLabel(period), data.meta.currency)}
        <span className={UI.sourceNoteEnd}>
          {TEXT.syntheticAssignmentDataset}
        </span>
      </div>
      <div className={UI.audienceToolbar}>
        <div
          className={UI.modeSwitch}
          role="group"
          aria-label={TEXT.audienceView}
        >
          <button
            aria-pressed={view.mode === DASHBOARD_MODE.EXECUTIVE}
            onClick={() => update({ mode: DASHBOARD_MODE.EXECUTIVE })}
          >
            {TEXT.executiveOverview}
          </button>
          <button
            aria-pressed={view.mode === DASHBOARD_MODE.ANALYST}
            onClick={() => update({ mode: DASHBOARD_MODE.ANALYST })}
          >
            {TEXT.analystDeepDive}
          </button>
        </div>
        <span>
          {view.mode === DASHBOARD_MODE.EXECUTIVE
            ? TEXT.executiveDescription
            : TEXT.analystDescription}
        </span>
      </div>
      <ViewControls data={data} view={view} update={update} />
      {view.status !== ALL_STATUSES && (
        <p className={UI.activeFilter}>
          {TEXT.latestStatusFilter(STATUS_LABELS[view.status])}{" "}
          <button
            className={UI.textButton}
            onClick={() => update({ status: ALL_STATUSES })}
          >
            {TEXT.clearFilter}
          </button>
        </p>
      )}
    </>
  );
}
