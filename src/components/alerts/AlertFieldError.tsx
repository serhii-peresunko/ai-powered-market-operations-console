const UI = { error: "field-error" } as const;

export function AlertFieldError({
  field,
  error,
}: {
  field: string;
  error?: string;
}) {
  if (!error) return null;
  return (
    <p id={`alert-${field}-error`} className={UI.error}>
      {error}
    </p>
  );
}
