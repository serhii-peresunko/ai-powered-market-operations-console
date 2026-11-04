"use client";
import { Component, type ReactNode } from "react";
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
      <p className={UI.notice} role="alert">
        {TEXT.failure}
      </p>
    ) : (
      this.props.children
    );
  }
}
