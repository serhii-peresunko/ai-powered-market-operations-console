"use client";
import { Button } from "@/components/Button";

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
      <p className={UI.eyebrow}>MARKET OPERATIONS</p>
      <h1>This view couldn’t be loaded.</h1>
      <p>Your URL selection is preserved. Try loading the view again.</p>
      <Button onClick={retry}>Try again</Button>
      <a href="?">Return to portfolio overview</a>
    </main>
  );
}
