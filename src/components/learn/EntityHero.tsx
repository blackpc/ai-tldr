/**
 * Product-page primitives for a catalogue entity (a /tools/<slug> tool or a
 * /models/<slug> model) — the compact marketplace masthead:
 *
 *   <EntityHero>    app icon + name + tagline + primary actions   (one row)
 *   <EntityBar>     chips + the whole fact strip                  (one line)
 *   <EntityInstall> the one-line install command, copyable        (one line)
 *   <WhatsNew>      newest changelog entry  ┐ side by side in .ent-updates
 *   <NewsRail>      latest stories, 1 line each ┘
 *
 * DENSITY IS THE POINT: every fact a visitor needs to judge "which version,
 * how fresh, is it maintained" has to fit above the article without pushing
 * the article off the screen. Earlier versions stacked six boxed rows and ate
 * ~640px before the first paragraph; this composition does the same job in
 * roughly 300px. Keep new facts INSIDE the existing rows — do not add a row.
 *
 * SHARED BY CONSTRUCTION: both catalogue page types render these same
 * components and the same `ent-*` CSS (defined once in learn.css), so a tool
 * page and a model page can never drift into two parallel designs.
 *
 * Everything is pure / SSR-safe — the prerenderers render these too, so the
 * version + freshness facts are in the static HTML (crawlable), not injected
 * by JS.
 */

import { useState, type ReactNode } from "react";
import { formatDay, monoStyle } from "./entityFormat";

/**
 * `data-internal` tells the section's click delegate to route the link through
 * the SPA — which for a SAME-PAGE anchor ("#changelog") is wrong: it pushes
 * the hash as a route and scrolls to the top instead of to the section. So the
 * attribute is set for real paths only; in-page anchors stay plain links and
 * keep native jump behaviour.
 */
const internal = (href: string) =>
  href.startsWith("#") ? undefined : ("true" as const);

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

/** First alphanumeric of a name, for the monogram plate. */
function initialOf(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").charAt(0).toUpperCase() || "#";
}

/** The "app icon": the brand logo on a light plate, or a deterministic
 *  monogram so EVERY entity has a visual identity. */
export function EntityLogo({
  logo,
  name,
  seed,
}: {
  logo?: string;
  name: string;
  seed: string;
}) {
  if (logo) {
    return (
      <span className="ent-logo" aria-hidden="true">
        <img src={logo} alt="" />
      </span>
    );
  }
  return (
    <span className="ent-logo ent-logo-mono" style={monoStyle(seed)} aria-hidden="true">
      {initialOf(name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export interface HeroChip {
  label: string;
  href?: string;
  /** `accent` marks the identity chip (category); `plain` is a quiet fact. */
  tone?: "accent" | "plain";
}

export interface HeroAction {
  label: string;
  href: string;
  /** Small trailing detail inside the button, e.g. "★ 90.6k" or a domain. */
  sub?: string;
  /** The filled accent button (one per page — the "GET" equivalent). */
  primary?: boolean;
  icon?: ReactNode;
}

/** Identity row: icon, name, tagline, actions — all on ONE line at desktop. */
export function EntityHero({
  logo,
  name,
  seed,
  tagline,
  actions = [],
}: {
  logo?: string;
  name: string;
  seed: string;
  tagline: string;
  actions?: HeroAction[];
}) {
  return (
    <div className="ent-hero">
      <EntityLogo logo={logo} name={name} seed={seed} />
      <div className="ent-hero-main">
        <h1 className="ent-hero-name">{name}</h1>
        <p className="ent-hero-tagline">{tagline}</p>
      </div>
      {actions.length > 0 && (
        <div className="ent-hero-actions">
          {actions.map((a) => (
            <a
              key={a.href}
              className={`ent-btn${a.primary ? " ent-btn-primary" : ""}`}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {a.icon && (
                <span className="ent-btn-ic" aria-hidden="true">
                  {a.icon}
                </span>
              )}
              <span className="ent-btn-lbl">{a.label}</span>
              {a.sub && <span className="ent-btn-sub">{a.sub}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fact bar
// ---------------------------------------------------------------------------

export interface SpecCell {
  k: string;
  v: string;
  /** Renders the value as a link (e.g. the story count → the news section). */
  href?: string;
  /** Accent the value — used for the live version + star count. */
  accent?: boolean;
}

/**
 * One thin rule-to-rule band carrying the classification chips, every key fact
 * (version / updated / licence / coverage) AND the install command — all on a
 * single line at desktop width. This replaced a boxed six-cell grid plus a
 * separate install row: same information, a fifth of the height, and it wraps
 * instead of scrolling sideways.
 */
export function EntityBar({
  chips = [],
  cells,
  install,
}: {
  chips?: HeroChip[];
  cells: SpecCell[];
  /** Install one-liner; sits at the right end of the band when there's room. */
  install?: string;
}) {
  if (chips.length === 0 && cells.length === 0 && !install) return null;
  return (
    <div className="ent-bar">
      <div className="ent-bar-main">
        {chips.map((c) =>
          c.href ? (
            <a
              key={c.label}
              className={`ent-chip ent-chip-${c.tone ?? "plain"}`}
              href={c.href}
              data-internal={internal(c.href)}
            >
              {c.label}
            </a>
          ) : (
            <span key={c.label} className={`ent-chip ent-chip-${c.tone ?? "plain"}`}>
              {c.label}
            </span>
          ),
        )}
        {cells.length > 0 && (
          <dl className="ent-facts" aria-label="Key facts">
            {cells.map((c) => (
              <div className="ent-fact" key={c.k}>
                <dt>{c.k}</dt>
                {/* title carries the untruncated value — some licences and MoE
                    parameter strings are far too long for one line. */}
                <dd className={c.accent ? "ent-fact-acc" : undefined} title={c.v}>
                  {c.href ? (
                    <a href={c.href} data-internal={internal(c.href)}>
                      {c.v}
                    </a>
                  ) : (
                    c.v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {install && <EntityInstall cmd={install} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Install command
// ---------------------------------------------------------------------------

/** Copyable one-liner — the dev-tool equivalent of the store's GET button. */
function EntityInstall({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="ent-install">
      <span className="ent-install-lbl">$</span>
      <code className="ent-install-cmd">{cmd}</code>
      <button
        type="button"
        className="ent-install-copy"
        onClick={() => {
          // A denied clipboard (permissions policy, insecure context) rejects
          // — swallow it so the page never logs an unhandled rejection; the
          // command stays visible and selectable either way.
          navigator.clipboard
            ?.writeText(cmd)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            })
            .catch(() => {});
        }}
      >
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Updates strip
// ---------------------------------------------------------------------------

/**
 * Lays "what's new" and the news rail side by side. With only one child that
 * child spans the full width (CSS `:only-child`), so a tool with no changelog
 * doesn't leave a hole.
 */
export function EntityUpdates({ children }: { children: ReactNode }) {
  return <div className="ent-updates">{children}</div>;
}

/**
 * The newest changelog entry — the store's "What's New" panel, trimmed to a
 * header line, a clamped note and its links. `historyCount` > 1 reveals the
 * jump down to the full version history.
 */
export function WhatsNew({
  version,
  date,
  note,
  releaseId,
  url,
  historyCount,
}: {
  version?: string;
  date: string;
  note: string;
  releaseId?: string;
  url?: string;
  historyCount: number;
}) {
  return (
    <section className="ent-new" aria-labelledby="ent-new-h">
      <div className="ent-panel-head">
        <h2 className="ent-panel-h" id="ent-new-h">
          What&apos;s new
        </h2>
        {version && <span className="ent-new-ver">{version}</span>}
        <span className="ent-panel-date">{formatDay(date)}</span>
      </div>
      <p className="ent-new-note">{note}</p>
      <div className="ent-new-links">
        {releaseId && (
          <a href={`/releases/${releaseId}/`} data-internal="true">
            our coverage →
          </a>
        )}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            changeset ↗
          </a>
        )}
        {historyCount > 1 && (
          <a className="ent-new-hist" href="#changelog">
            {historyCount} versions ↓
          </a>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// News rail
// ---------------------------------------------------------------------------

export interface RailItem {
  id: string;
  date: string;
  title: string;
  importance: string;
}

/** The latest stories as one-line rows, with a jump to the full list below. */
export function NewsRail({ items, total }: { items: RailItem[]; total: number }) {
  if (items.length === 0) return null;
  return (
    <section className="ent-rail" aria-labelledby="ent-rail-h">
      <div className="ent-panel-head">
        <h2 className="ent-panel-h" id="ent-rail-h">
          Latest news
        </h2>
        {total > items.length && (
          <a className="ent-rail-all" href="#news">
            all {total} ↓
          </a>
        )}
      </div>
      <ul className="ent-rail-list">
        {items.map((it) => (
          <li key={it.id}>
            <a
              className="ent-rail-row"
              href={`/releases/${it.id}/`}
              data-internal="true"
            >
              <span className="ent-rail-date">{formatDay(it.date)}</span>
              <span className="ent-rail-title">{it.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
