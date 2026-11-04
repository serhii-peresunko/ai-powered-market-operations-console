"use client";
import { Component, type ReactNode } from "react";

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
        The chart could not be displayed. Use the data table below to inspect
        the same values.
      </p>
    ) : (
      this.props.children
    );
  }
}
