export function money(value: number, currency = "USD", compact = true) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0,
  }).format(value);
}

export function percent(value: number | null, signed = false) {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value / 100);
}

export function periodLabel(period: string, short = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(new Date(`${period}-01T00:00:00Z`));
}
