/**
 * /models — the LLM registry.
 *
 * Finder-style Miller columns: maker ▸ family ▸ model (the same pattern as
 * /learn/landscape's category ▸ subcategory ▸ tool). The whole structure is
 * visible at a glance and you drill across by clicking. NO inner scrollbars —
 * only the page scrolls; the two nav columns stick while the models column
 * scrolls past them. Cross-cutting TAG filters (open-weights / reasoning /
 * multimodal / …) narrow every column at once.
 *
 * Pure / SSR-safe — also rendered server-side by prerender-models.tsx.
 */

import { useEffect, useMemo, useState } from "react";

import registryData from "../../data/models/registry.json";
import type {
  ModelRegistry,
  ModelMaker,
  ModelEntry,
  ModelTag,
} from "../../data/models/schema";
import { modelPath } from "../../data/models/schema";

const DATA = registryData as ModelRegistry;

/** Per-maker accent, cycled across a fixed neon palette. */
const ACCENTS = [
  "#f7ff00", "#4fe0c0", "#6aa6ff", "#ff86c2", "#b98bff", "#ffb14a",
  "#8ce85a", "#ff6b5d", "#39d0d8", "#d8d84a", "#ff9e64", "#7aa2f7",
  "#bb9af7", "#9ece6a", "#e0af68", "#f7768e", "#2ac3de",
];
const accentOf = (idx: number) => ACCENTS[idx % ACCENTS.length];

/** Display order + label for the tag filter chips. */
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

function matchModel(m: ModelEntry, q: string): boolean {
  return (
    m.name.toLowerCase().includes(q) ||
    m.blurb.toLowerCase().includes(q) ||
    (m.license ?? "").toLowerCase().includes(q)
  );
}

function ModelTile({ model }: { model: ModelEntry }) {
  return (
    <div className="reg-tile">
      <a
        className="reg-tile-link"
        href={modelPath(model.slug)}
        data-internal="true"
        aria-label={`${model.name} — details`}
      >
        <span className="reg-tile-row">
          <span className="reg-tile-name">{model.name}</span>
          {model.contextWindow && (
            <span className="reg-tile-ctx" title="Context window">
              {model.contextWindow}
            </span>
          )}
        </span>
        <span className="reg-tile-desc">{model.blurb}</span>
        <span className="reg-tile-tags">
          {model.license && <span className="reg-tile-lic">{model.license}</span>}
          {model.tags.slice(0, 3).map((t) => (
            <span className="reg-tile-tag" key={t}>
              {TAG_LABELS[t]}
            </span>
          ))}
        </span>
      </a>
      <span className="reg-tile-foot">
        <span className="reg-tile-cta">details →</span>
      </span>
    </div>
  );
}

interface FilteredFamily {
  id: string;
  title: string;
  models: ModelEntry[];
}
interface FilteredMaker {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  count: number;
  families: FilteredFamily[];
}

/** Read the current maker / family selection from the URL query (?maker=&family=). */
function readSelection(): { maker: string | null; family: string | null } {
  if (typeof window === "undefined") return { maker: null, family: null };
  const p = new URLSearchParams(window.location.search);
  return { maker: p.get("maker"), family: p.get("family") };
}

/** Read active tag filters from the URL (?tag=a,b). */
function readTags(): Set<ModelTag> {
  if (typeof window === "undefined") return new Set();
  const raw = new URLSearchParams(window.location.search).get("tag");
  if (!raw) return new Set();
  const valid = new Set(TAG_ORDER);
  return new Set(
    raw.split(",").map((t) => t.trim()).filter((t): t is ModelTag => valid.has(t as ModelTag)),
  );
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
    let models = 0;
    for (const mk of DATA.makers)
      for (const f of mk.families) models += f.models.length;
    return { models, makers: DATA.makers.length };
  }, []);

  // Which tags actually appear (so we only show usable chips).
  const availableTags = useMemo(() => {
    const s = new Set<ModelTag>();
    for (const mk of DATA.makers)
      for (const f of mk.families)
        for (const m of f.models) for (const t of m.tags) s.add(t);
    return TAG_ORDER.filter((t) => s.has(t));
  }, []);

  const passes = (m: ModelEntry) => {
    if (q && !matchModel(m, q)) return false;
    for (const t of tags) if (!m.tags.includes(t)) return false;
    return true;
  };

  const tree = useMemo<FilteredMaker[]>(() => {
    return DATA.makers
      .map((mk: ModelMaker, i) => {
        const families = mk.families
          .map((f) => ({
            id: f.id,
            title: f.title,
            models: f.models.filter(passes),
          }))
          .filter((f) => f.models.length > 0);
        const count = families.reduce((n, f) => n + f.models.length, 0);
        return {
          id: mk.id,
          title: mk.title,
          blurb: mk.blurb,
          accent: accentOf(i),
          count,
          families,
        };
      })
      .filter((mk) => mk.families.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tags]);

  const maker = tree.find((mk) => mk.id === sel.maker) ?? tree[0];
  const family = maker
    ? maker.families.find((f) => f.id === sel.family) ?? maker.families[0]
    : undefined;

  const navigate = (makerId: string, familyId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("maker", makerId);
    params.set("family", familyId);
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    setSel({ maker: makerId, family: familyId });
  };
  const selectMaker = (id: string) => {
    const next = tree.find((mk) => mk.id === id);
    navigate(id, next?.families[0]?.id ?? "");
  };
  const selectFamily = (id: string) => {
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
            placeholder="Filter models — name or what it's for…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter models"
          />
          {query && (
            <button
              className="reg-search-x"
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
            >
              ✕
            </button>
          )}
        </label>
        <dl className="reg-stats">
          <div className="reg-stat">
            <dd>{stats.models}</dd>
            <dt>models</dt>
          </div>
          <div className="reg-stat">
            <dd>{stats.makers}</dd>
            <dt>makers</dt>
          </div>
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

      {!maker || !family ? (
        <p className="reg-empty">
          No models match{query ? ` “${query}”` : ""}
          {tags.size ? " with those tags" : ""}. Try a broader filter.
        </p>
      ) : (
        <div className="reg-miller">
          {/* Column 1 — makers */}
          <div className="reg-mcol reg-mcol-makers">
            <div className="reg-msticky">
              <div className="reg-mhdr">
                Makers <span className="reg-mhdr-n">{tree.length}</span>
              </div>
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
                  <span className="reg-mname">{mk.title}</span>
                  <span className="reg-mn">{mk.count}</span>
                  <span className="reg-marr" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2 — families of the selected maker */}
          <div
            className="reg-mcol reg-mcol-families"
            style={{ ["--cat" as string]: maker.accent }}
          >
            <div className="reg-msticky">
              <div className="reg-mhdr">{maker.title}</div>
              {maker.families.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`reg-mrow${f.id === family.id ? " is-on" : ""}`}
                  onClick={() => selectFamily(f.id)}
                  aria-current={f.id === family.id}
                >
                  <span className="reg-mname">{f.title}</span>
                  <span className="reg-mn">{f.models.length}</span>
                  <span className="reg-marr" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3 — models in the selected family */}
          <div
            className="reg-mcol reg-mcol-models"
            style={{ ["--cat" as string]: maker.accent }}
          >
            <div className="reg-mhdr reg-mhdr-models">
              <span className="reg-mhdr-title">{family.title}</span>
              <span className="reg-mhdr-sub">
                {maker.title} · {family.models.length} model
                {family.models.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="reg-mtiles">
              {family.models.map((m) => (
                <ModelTile key={m.slug} model={m} />
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="reg-note">
        A registry of large language models — frontier and open-weight — with
        specs, benchmarks, pricing and APIs. Click any model for a detail page.
        Numbers trace to verified sources and refresh as models ship.
      </p>
    </div>
  );
}
