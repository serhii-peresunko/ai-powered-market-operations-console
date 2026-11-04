export const FORMAT = {
  locale: "en-US",
  currency: "USD",
  percentBase: 100,
  missingValue: "Unavailable",
} as const;

export function integer(value: number) {
  return new Intl.NumberFormat(FORMAT.locale).format(value);
}

export function money(
  value: number,
  currency: string = FORMAT.currency,
  compact = true,
) {
  return new Intl.NumberFormat(FORMAT.locale, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0,
  }).format(value);
}

export function percent(value: number | null, signed = false) {
  if (value === null) return FORMAT.missingValue;
  return new Intl.NumberFormat(FORMAT.locale, {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value / FORMAT.percentBase);
}

export function periodLabel(period: string, short = false) {
  return new Intl.DateTimeFormat(FORMAT.locale, {
    month: "short",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(new Date(`${period}-01T00:00:00Z`));
}
