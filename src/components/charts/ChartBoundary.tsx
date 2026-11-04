"use client";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { CHART_BOUNDARY_TEXT as TEXT } from "./copy";

const UI = {
  notice: "notice",
} as const;

export class ChartBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className={UI.notice} role="alert">
        <p>{TEXT.failure}</p>
        <Button
          variant="secondary"
          onClick={() => this.setState({ failed: false })}
        >
          {TEXT.retry}
        </Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
