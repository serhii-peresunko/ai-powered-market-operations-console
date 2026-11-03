import {
  RiArrowUpLine,
  RiBarChartBoxLine,
  RiDashboardLine,
  RiLayoutGridLine,
  RiSparklingLine,
} from "@remixicon/react";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.console}>
      <a href="#dashboard" className={styles.skipLink}>
        Skip to dashboard
      </a>

      <aside className={styles.sidebar} aria-label="Workspace navigation">
        <a href="#dashboard" className={styles.brand}>
          <span className={styles.brandIcon}>
            <RiBarChartBoxLine size={22} aria-hidden="true" />
          </span>
          <span>
            Market Ops
            <span className={styles.brandCaption}>Operations console</span>
          </span>
        </a>

        <nav aria-label="Main navigation" className={styles.navigation}>
          <p className={styles.eyebrow}>Workspace</p>
          <Button asChild variant="ghost" className={styles.navItem}>
            <a href="#dashboard" aria-current="page">
              <RiDashboardLine size={18} aria-hidden="true" />
              Dashboard
            </a>
          </Button>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.workspaceMark} aria-hidden="true">M</span>
          <div>
            <p className={styles.workspaceName}>Market operations</p>
            <p className={styles.muted}>Your workspace</p>
          </div>
        </div>
      </aside>

      <main id="dashboard" className={styles.dashboard}>
        <header className={styles.pageHeader}>
          <p className={styles.breadcrumb}>Workspace / Overview</p>
          <h1>Dashboard</h1>
          <p className={styles.description}>
            A clear view of your market operations.
          </p>
        </header>

        <Card className={styles.dashboardCard}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              <RiLayoutGridLine size={26} aria-hidden="true" />
            </span>
            <h2>Your dashboard starts here</h2>
            <p>Market insights and visualizations will appear here.</p>
          </div>
        </Card>
      </main>

      <aside id="assistant" className={styles.assistant} aria-labelledby="assistant-title">
        <header className={styles.assistantHeader}>
          <span className={styles.assistantIcon}>
            <RiSparklingLine size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 id="assistant-title">AI assistant</h2>
            <p className={styles.muted}>Your market copilot</p>
          </div>
          <span className={styles.previewBadge}>Preview</span>
        </header>

        <div className={styles.assistantBody}>
          <div className={styles.assistantWelcome}>
            <span className={styles.welcomeIcon}>
              <RiSparklingLine size={27} aria-hidden="true" />
            </span>
            <h3>A little clarity, on demand</h3>
            <p>A space to explore your markets, ask questions, and find insights.</p>
          </div>
        </div>

        <div className={styles.composerArea}>
          <div className={styles.composer}>
            <label htmlFor="assistant-message" className="sr-only">Message the AI assistant</label>
            <textarea
              id="assistant-message"
              placeholder="Ask about your markets…"
              aria-describedby="assistant-availability"
              rows={2}
              disabled
            />
            <div className={styles.composerActions}>
              <span className={styles.muted}>AI assistant</span>
              <Button disabled aria-label="Send message" className={styles.sendButton}>
                <RiArrowUpLine size={17} aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p id="assistant-availability" className={styles.composerNote}>
            Chat will be available when the assistant is connected.
          </p>
        </div>
      </aside>
    </div>
  );
}
