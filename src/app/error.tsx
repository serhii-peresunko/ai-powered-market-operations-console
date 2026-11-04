"use client";
import { Button } from "@/shared/ui/Button";
import { ERROR_TEXT as TEXT } from "./copy";

const UI = {
  recoveryPage: "recovery-page",
  eyebrow: "eyebrow",
} as const;

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className={UI.recoveryPage}>
      <p className={UI.eyebrow}>{TEXT.eyebrow}</p>
      <h1>{TEXT.title}</h1>
      <p>{TEXT.description}</p>
      <Button onClick={retry}>{TEXT.retry}</Button>
      <a href="?">{TEXT.returnToOverview}</a>
    </main>
  );
}
