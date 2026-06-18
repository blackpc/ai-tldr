/**
 * /models — the LLM registry.
 *
 * Finder-style Miller columns, structured like /learn/landscape: maker ▸ line ▸
 * versions. Pick a maker, pick one of its model LINES (Claude Opus, Gemini
 * Flash, Gemma…), and the third column fills with EVERY version of that line as
 * a clickable card — the current release and every historical version alike,
 * each opening its own detail page. NO inner scrollbars; only the page scrolls
 * while the two nav columns stick. Cross-cutting TAG filters narrow all columns.
 *
 * Pure / SSR-safe — also rendered server-side by prerender-models.tsx.
 */

import { useEffect, useMemo, useState } from "react";

import registryData from "../../data/models/registry.json";
import type {
  ModelRegistry,
  ModelMaker,
  ModelLine,
  ModelEntry,
  ModelTag,
} from "../../data/models/schema";
import { modelPath } from "../../data/models/schema";

const DATA = registryData as ModelRegistry;

const ACCENTS = [
  "#f7ff00", "#4fe0c0", "#6aa6ff", "#ff86c2", "#b98bff", "#ffb14a",
  "#8ce85a", "#ff6b5d", "#39d0d8", "#d8d84a", "#ff9e64", "#7aa2f7",
  "#bb9af7", "#9ece6a", "#e0af68", "#f7768e", "#2ac3de",
];
const accentOf = (idx: number) => ACCENTS[idx % ACCENTS.length];

const TAG_LABELS: Record<ModelTag, string> = {
  frontier: "Frontier",
  "open-weights": "Open weights",
  proprietary: "Proprietary",
  reasoning: "Reasoning",
  multimodal: "Multimodal",
  coding: "Coding",
  "long-context": "Long context",
  "on-device": "On-device",
  "free-tier": "Free tier",
  agentic: "Agentic",
};
const TAG_ORDER = Object.keys(TAG_LABELS) as ModelTag[];

function matchVersion(v: ModelEntry, q: string): boolean {
  return (
    v.name.toLowerCase().includes(q) ||
    v.blurb.toLowerCase().includes(q) ||
    (v.license ?? "").toLowerCase().includes(q)
  );
}

interface FilteredLine {
  id: string;
  title: string;
  blurb: string;
  versions: ModelEntry[];
}
interface FilteredMaker {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  count: number;
  logo?: string;
  lines: FilteredLine[];
}

/** Small square brand mark shown beside a maker. Falls back to nothing (the
 *  accent bar carries identity) when a maker has no logo yet. */
function MakerLogo({ logo }: { logo?: string }) {
  if (!logo) return null;
  return (
    <span className="reg-mlogo" aria-hidden="true">
      <img src={logo} alt="" loading="lazy" />
    </span>
  );
}

/** One version of the selected line, as a clickable card → its detail page. */
function VersionCard({ v }: { v: ModelEntry }) {
  return (
    <a
      className={`reg-ver${v.current ? " reg-ver-cur" : ""}`}
      href={modelPath(v.slug)}
      data-internal="true"
      aria-label={`${v.name} — details`}
    >
      <span className="reg-ver-top">
        <span className="reg-ver-name">{v.name}</span>
        {v.current && <span className="reg-ver-badge">current</span>}
        {v.date && <span className="reg-ver-date">{v.date}</span>}
      </span>
      <span className="reg-ver-desc">{v.blurb}</span>
      <span className="reg-ver-tags">
        {v.license && <span className="reg-ver-lic">{v.license}</span>}
        {v.tags.slice(0, 3).map((t) => (
          <span className="reg-ver-tag" key={t}>{TAG_LABELS[t]}</span>
        ))}
        {v.contextWindow && <span className="reg-ver-ctx">{v.contextWindow}</span>}
      </span>
      <span className="reg-ver-cta">{v.rich ? "specs, benchmarks & pricing →" : "details →"}</span>
    </a>
  );
}

function readSelection(): { maker: string | null; line: string | null } {
  if (typeof window === "undefined") return { maker: null, line: null };
  const p = new URLSearchParams(window.location.search);
  return { maker: p.get("maker"), line: p.get("line") };
}
function readTags(): Set<ModelTag> {
  if (typeof window === "undefined") return new Set();
  const raw = new URLSearchParams(window.location.search).get("tag");
  if (!raw) return new Set();
  const valid = new Set(TAG_ORDER);
  return new Set(raw.split(",").map((t) => t.trim()).filter((t): t is ModelTag => valid.has(t as ModelTag)));
}

export function ModelsRegistryPage() {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(readSelection);
  const [tags, setTags] = useState<Set<ModelTag>>(readTags);

  useEffect(() => {
    const onPop = () => {
      setSel(readSelection());
      setTags(readTags());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const q = query.trim().toLowerCase();

  const stats = useMemo(() => {
    let models = 0, lines = 0;
    for (const mk of DATA.makers) {
      lines += mk.lines.length;
      for (const l of mk.lines) models += l.versions.length;
    }
    return { models, lines, makers: DATA.makers.length };
  }, []);

  const availableTags = useMemo(() => {
    const s = new Set<ModelTag>();
    for (const mk of DATA.makers)
      for (const l of mk.lines) for (const v of l.versions) for (const t of v.tags) s.add(t);
    return TAG_ORDER.filter((t) => s.has(t));
  }, []);

  const passes = (v: ModelEntry) => {
    if (q && !matchVersion(v, q)) return false;
    for (const t of tags) if (!v.tags.includes(t)) return false;
    return true;
  };

  const tree = useMemo<FilteredMaker[]>(() => {
    return DATA.makers
      .map((mk: ModelMaker, i): FilteredMaker => {
        const lines = mk.lines
          .map((l: ModelLine) => ({ id: l.id, title: l.title, blurb: l.blurb, versions: l.versions.filter(passes) }))
          .filter((l) => l.versions.length > 0);
        const count = lines.reduce((n, l) => n + l.versions.length, 0);
        return { id: mk.id, title: mk.title, blurb: mk.blurb, accent: accentOf(i), count, logo: mk.logo, lines };
      })
      .filter((mk) => mk.lines.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tags]);

  const maker = tree.find((mk) => mk.id === sel.maker) ?? tree[0];
  const line = maker ? maker.lines.find((l) => l.id === sel.line) ?? maker.lines[0] : undefined;

  const navigate = (makerId: string, lineId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("maker", makerId);
    params.set("line", lineId);
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    setSel({ maker: makerId, line: lineId });
  };
  const selectMaker = (id: string) => {
    const next = tree.find((mk) => mk.id === id);
    navigate(id, next?.lines[0]?.id ?? "");
  };
  const selectLine = (id: string) => {
    if (maker) navigate(maker.id, id);
  };

  const toggleTag = (t: ModelTag) => {
    const next = new Set(tags);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    const params = new URLSearchParams(window.location.search);
    if (next.size) params.set("tag", [...next].join(","));
    else params.delete("tag");
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    setTags(next);
  };

  return (
    <div className="reg-page">
      <div className="reg-bar">
        <h1 className="reg-title">
          LLM <span className="reg-title-accent">Registry</span>
        </h1>
        <label className="reg-search">
          <span className="reg-search-ic" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Filter — model, version or license…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter models"
          />
          {query && (
            <button className="reg-search-x" type="button" onClick={() => setQuery("")} aria-label="Clear filter">✕</button>
          )}
        </label>
        <dl className="reg-stats">
          <div className="reg-stat"><dd>{stats.models}</dd><dt>models</dt></div>
          <div className="reg-stat"><dd>{stats.lines}</dd><dt>lines</dt></div>
          <div className="reg-stat"><dd>{stats.makers}</dd><dt>makers</dt></div>
        </dl>
      </div>

      {availableTags.length > 0 && (
        <div className="reg-tagbar" role="group" aria-label="Filter by tag">
          {availableTags.map((t) => (
            <button
              key={t}
              type="button"
              className={`reg-chip${tags.has(t) ? " is-on" : ""}`}
              onClick={() => toggleTag(t)}
              aria-pressed={tags.has(t)}
            >
              {TAG_LABELS[t]}
            </button>
          ))}
          {tags.size > 0 && (
            <button
              type="button"
              className="reg-chip reg-chip-clear"
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.delete("tag");
                window.history.pushState({}, "", `${window.location.pathname}?${params}`);
                setTags(new Set());
              }}
            >
              clear
            </button>
          )}
        </div>
      )}

      {!maker || !line ? (
        <p className="reg-empty">
          No models match{query ? ` “${query}”` : ""}{tags.size ? " with those tags" : ""}. Try a broader filter.
        </p>
      ) : (
        <div className="reg-miller">
          {/* Column 1 — makers */}
          <div className="reg-mcol reg-mcol-makers">
            <div className="reg-msticky">
              <div className="reg-mhdr">Makers <span className="reg-mhdr-n">{tree.length}</span></div>
              {tree.map((mk) => (
                <button
                  key={mk.id}
                  type="button"
                  className={`reg-mrow${mk.id === maker.id ? " is-on" : ""}`}
                  style={{ ["--cat" as string]: mk.accent }}
                  onClick={() => selectMaker(mk.id)}
                  aria-current={mk.id === maker.id}
                >
                  <span className="reg-mbar" aria-hidden="true" />
                  <MakerLogo logo={mk.logo} />
                  <span className="reg-mname">{mk.title}</span>
                  <span className="reg-mn">{mk.count}</span>
                  <span className="reg-marr" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2 — lines of the selected maker */}
          <div className="reg-mcol reg-mcol-lines" style={{ ["--cat" as string]: maker.accent }}>
            <div className="reg-msticky">
              <div className="reg-mhdr reg-mhdr-maker">
                <MakerLogo logo={maker.logo} />
                {maker.title}
              </div>
              {maker.lines.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`reg-mrow${l.id === line.id ? " is-on" : ""}`}
                  onClick={() => selectLine(l.id)}
                  aria-current={l.id === line.id}
                >
                  <span className="reg-mname">{l.title}</span>
                  <span className="reg-mn">{l.versions.length}</span>
                  <span className="reg-marr" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3 — every version of the selected line, clickable */}
          <div className="reg-mcol reg-mcol-versions" style={{ ["--cat" as string]: maker.accent }}>
            <div className="reg-mhdr reg-mhdr-versions">
              <span className="reg-mhdr-title">{line.title}</span>
              <span className="reg-mhdr-sub">
                {maker.title} · {line.versions.length} version{line.versions.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="reg-vtiles">
              {line.versions.map((v) => (
                <VersionCard key={v.slug} v={v} />
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="reg-note">
        A registry of large language models — frontier and open-weight. Pick a
        maker, then a line, to browse every version; each version has its own
        page with specs, benchmarks, pricing, APIs and lineage. Numbers trace to
        verified sources and refresh as models ship.
      </p>
    </div>
  );
}
