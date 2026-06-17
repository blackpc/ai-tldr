/**
 * Types for the AI Release Index (/stats). The DATA is precomputed at build
 * time by `scripts/build-stats.ts` into `stats.json` (the same pattern as
 * learn/count.json) so the main bundle never imports landscape.json — the
 * page and the prerender both read the tiny generated JSON, not the source
 * taxonomy. Every number is derived from the verified feed + landscape, so
 * the page stays inside the zero-hallucination policy.
 */

export interface StatLab {
  name: string;
  count: number;
}

export interface StatCategory {
  category: string;
  count: number;
}

export interface StatImportance {
  importance: string;
  count: number;
}

export interface StatWeek {
  /** ISO date (YYYY-MM-DD) of the start of the 7-day bucket. */
  weekStart: string;
  count: number;
}

export interface StatTool {
  name: string;
  slug: string;
  stars: number;
  category: string;
}

export interface StatLabCadence {
  name: string;
  releases: number;
  /** Mean days between this lab's consecutive tracked release dates. */
  avgDaysBetween: number;
}

export interface StatsData {
  /** Build date (YYYY-MM-DD) — shown as the "updated" stamp. */
  generatedAt: string;
  totals: {
    releases: number;
    thisWeek: number;
    thisMonth: number;
    ossTools: number;
    labs: number;
    learnArticles: number;
  };
  /** Top labs by tracked-release count (desc). */
  topLabs: StatLab[];
  /** Releases by primary category (desc). */
  byCategory: StatCategory[];
  /** Releases by editorial importance band. */
  byImportance: StatImportance[];
  /** Releases per 7-day bucket, oldest → newest (last 12 weeks). */
  perWeek: StatWeek[];
  /** Most-starred tracked open-source tools (desc). */
  topTools: StatTool[];
  /**
   * Original, citable cadence/velocity numbers — the kind of figure nobody
   * else publishes, so an AI engine or Wikipedia editor must attribute it.
   */
  velocity: {
    /** Mean releases per 7-day bucket over the last 12 weeks. */
    perWeekAvg: number;
    last4Weeks: number;
    prev4Weeks: number;
    /** % change, last 4 weeks vs the prior 4 weeks (rounded). */
    momentumPct: number;
    /** Seismic + major releases in the last 90 days (frontier velocity). */
    frontierLast90: number;
  };
  /** Fastest-shipping labs by mean days between releases (asc, 4+ releases). */
  labCadence: StatLabCadence[];
}
