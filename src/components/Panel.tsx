import type { ReactNode } from "react";
import { Card } from "./Card";
import { cx } from "@/lib/utils";

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
      className={cx("panel", className)}
      role="region"
      aria-labelledby={titleId}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        {action}
      </div>
      {description && (
        <p id={descriptionId} className="panel-description">
          {description}
        </p>
      )}
      {children}
    </Card>
  );
}
