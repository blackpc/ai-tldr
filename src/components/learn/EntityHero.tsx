/**
 * Product-page primitives for a catalogue entity (a /tools/<slug> tool or a
 * /models/<slug> model) — the App-Store-style masthead:
 *
 *   <EntityHero>    app icon + name + tagline + chips + primary actions
 *   <EntityInstall> the one-line install command, copyable
 *   <EntitySpecs>   the scannable spec strip (stars / version / updated / …)
 *   <WhatsNew>      the newest changelog entry, right under the fold line
 *   <NewsRail>      the three latest stories, linking into the full list
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

/** The big "app icon": the brand logo on a light plate, or a deterministic
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
  /** Small second line inside the button, e.g. "★ 90.2k" or a domain. */
  sub?: string;
  /** The filled accent button (one per page — the "GET" equivalent). */
  primary?: boolean;
  icon?: ReactNode;
}

export function EntityHero({
  logo,
  name,
  seed,
  tagline,
  chips = [],
  actions = [],
}: {
  logo?: string;
  name: string;
  seed: string;
  tagline: string;
  chips?: HeroChip[];
  actions?: HeroAction[];
}) {
  return (
    <div className="ent-hero">
      <EntityLogo logo={logo} name={name} seed={seed} />
      <div className="ent-hero-main">
        <h1 className="ent-hero-name">{name}</h1>
        <p className="ent-hero-tagline">{tagline}</p>
        {chips.length > 0 && (
          <div className="ent-hero-chips">
            {chips.map((c) =>
              c.href ? (
                <a
                  key={c.label}
                  className={`ent-chip ent-chip-${c.tone ?? "plain"}`}
                  href={c.href}
                  data-internal="true"
                >
                  {c.label}
                </a>
              ) : (
                <span
                  key={c.label}
                  className={`ent-chip ent-chip-${c.tone ?? "plain"}`}
                >
                  {c.label}
                </span>
              ),
            )}
          </div>
        )}
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
// Install command
// ---------------------------------------------------------------------------

/** Copyable one-liner — the dev-tool equivalent of the store's GET button. */
export function EntityInstall({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="ent-install">
      <span className="ent-install-lbl">INSTALL</span>
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
// Spec strip
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
 * The scannable fact strip under the hero — this is where "what version, how
 * fresh" lives, above the fold. Scrolls inside itself on narrow screens (the
 * page body must never scroll sideways).
 */
export function EntitySpecs({ cells }: { cells: SpecCell[] }) {
  if (cells.length === 0) return null;
  return (
    <dl className="ent-specs" aria-label="Key facts">
      {cells.map((c) => (
        <div className="ent-spec" key={c.k}>
          <dt>{c.k}</dt>
          {/* title carries the untruncated value — some licences and MoE
              parameter strings are far too long for a strip cell. */}
          <dd className={c.accent ? "ent-spec-acc" : undefined} title={c.v}>
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
  );
}

// ---------------------------------------------------------------------------
// What's new
// ---------------------------------------------------------------------------

/**
 * The newest changelog entry, promoted to the top of the page — the store's
 * "What's New" panel. `historyCount` > 1 reveals the jump link down to the
 * full version history.
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
      <div className="ent-new-head">
        <h2 className="ent-new-h" id="ent-new-h">
          <span className="lrn-h2-mark" aria-hidden="true">//</span> What&apos;s new
        </h2>
        {version && <span className="ent-new-ver">{version}</span>}
        <span className="ent-new-date">{formatDay(date)}</span>
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
            version history ({historyCount}) ↓
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

/** The three latest stories as cards, with a jump to the full list below. */
export function NewsRail({ items, total }: { items: RailItem[]; total: number }) {
  if (items.length === 0) return null;
  return (
    <section className="ent-rail" aria-labelledby="ent-rail-h">
      <div className="ent-rail-head">
        <h2 className="ent-rail-h" id="ent-rail-h">
          <span className="lrn-h2-mark" aria-hidden="true">//</span> Latest news
        </h2>
        {total > items.length && <a href="#news">all {total} stories ↓</a>}
      </div>
      <ul className="ent-rail-list">
        {items.map((it) => (
          <li key={it.id}>
            <a
              className="ent-rail-card"
              href={`/releases/${it.id}/`}
              data-internal="true"
            >
              <span className="ent-rail-meta">
                <span className="ent-rail-date">{formatDay(it.date)}</span>
                <span className={`lrn-news-imp lrn-news-imp-${it.importance}`}>
                  {it.importance.toUpperCase()}
                </span>
              </span>
              <span className="ent-rail-title">{it.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
