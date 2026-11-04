import type { ReactNode } from "react";

const UI = {
  tableScroll: "table-scroll",
  dataAlternative: "data-alternative",
} as const;

export function DataTable({
  label,
  caption,
  summary,
  children,
}: {
  label: string;
  caption: ReactNode;
  summary?: string;
  children: ReactNode;
}) {
  const table = (
    <div
      className={UI.tableScroll}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <table>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
  return summary ? (
    <details className={UI.dataAlternative}>
      <summary>{summary}</summary>
      {table}
    </details>
  ) : (
    table
  );
}
