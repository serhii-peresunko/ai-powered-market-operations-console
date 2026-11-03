import type { ReactNode } from "react";

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
    <div className="table-scroll" tabIndex={0} role="region" aria-label={label}>
      <table>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
  return summary ? (
    <details className="data-alternative">
      <summary>{summary}</summary>
      {table}
    </details>
  ) : (
    table
  );
}
