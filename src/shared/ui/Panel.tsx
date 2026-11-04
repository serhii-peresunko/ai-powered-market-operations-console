import type { ReactNode } from "react";
import { Card } from "./Card";
import { cx } from "../lib/utils";

const UI = {
  panel: "panel",
  panelHeading: "panel-heading",
  eyebrow: "eyebrow",
  panelDescription: "panel-description",
} as const;

export function Panel({
  id,
  title,
  titleId = `${id}-title`,
  eyebrow,
  description,
  descriptionId,
  action,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  titleId?: string;
  eyebrow: string;
  description?: ReactNode;
  descriptionId?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      id={id}
      className={cx(UI.panel, className)}
      role="region"
      aria-labelledby={titleId}
    >
      <div className={UI.panelHeading}>
        <div>
          <p className={UI.eyebrow}>{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        {action}
      </div>
      {description && (
        <p id={descriptionId} className={UI.panelDescription}>
          {description}
        </p>
      )}
      {children}
    </Card>
  );
}
