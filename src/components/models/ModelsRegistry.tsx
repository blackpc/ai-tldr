/**
 * /models — the LLM registry.
 *
 * Finder-style Miller columns, structured EXACTLY like /learn/landscape
 * (category ▸ subcategory ▸ tools): here it's maker ▸ model ▸ versions. Pick a
 * maker, pick one of its models, and the third column fills with that model's
 * VERSION TIMELINE as cards — the current release (a card that opens the full
 * detail page) plus every older version in its lineage. The whole structure is
 * visible at a glance; NO inner scrollbars — only the page scrolls while the
 * two nav columns stick. Cross-cutting TAG filters narrow every column at once.
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
  ModelVersion,
} from "../../data/models/schema";
import { modelPath } from "../../data/models/schema";

const DATA = registryData as ModelRegistry;

/** Per-maker accent, cycled across the same fixed neon palette as landscape. */
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

/** A maker's models, flattened out of its families (the family level is an
 *  implementation detail of the data; the registry browses maker ▸ model). */
function makerModels(mk: ModelMaker): ModelEntry[] {
  return mk.families.flatMap((f) => f.models);
}

function matchModel(m: ModelEntry, q: string): boolean {
  return (
    m.name.toLowerCase().includes(q) ||
    m.blurb.toLowerCase().includes(q) ||
    (m.license ?? "").toLowerCase().includes(q) ||
    (m.versions ?? []).some((v) => v.version.toLowerCase().includes(q))
  );
}

interface FilteredMaker {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  count: number;
  models: ModelEntry[];
}

/** Read the current maker / model selection from the URL query (?maker=&model=). */
function readSelection(): { maker: string | null; model: string | null } {
  if (typeof window === "undefined") return { maker: null, model: null };
  const p = new URLSearchParams(window.location.search);
  return { maker: p.get("maker"), model: p.get("model") };
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

/** One version of the selected model, as a card. The current release links to
 *  the full detail page; older versions are informational lineage cards. */
function VersionCard({
  version,
  model,
}: {
  version: ModelVersion;
  model: ModelEntry;
}) {
  if (version.current) {
    return (
      <a
        className="reg-ver reg-ver-cur"
        href={modelPath(model.slug)}
        data-internal="true"
        aria-label={`${model.name} — full specs, benchmarks and pricing`}
      >
        <span className="reg-ver-top">
          <span className="reg-ver-name">{version.version}</span>
          <span className="reg-ver-badge">current</span>
        </span>
        {version.date && <span className="reg-ver-date">{version.date}</span>}
        <span className="reg-ver-desc">{model.blurb}</span>
        <span className="reg-ver-tags">
          {model.license && <span className="reg-ver-lic">{model.license}</span>}
          {model.tags.slice(0, 3).map((t) => (
            <span className="reg-ver-tag" key={t}>{TAG_LABELS[t]}</span>
          ))}
        </span>
        <span className="reg-ver-cta">full specs, benchmarks &amp; pricing →</span>
      </a>
    );
  }
  return (
    <div className="reg-ver reg-ver-old">
      <span className="reg-ver-top">
        <span className="reg-ver-name">{version.version}</span>
        {version.date && <span className="reg-ver-date">{version.date}</span>}
      </span>
      {version.note && <span className="reg-ver-note">{version.note}</span>}
    </div>
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
    for (const mk of DATA.makers) models += makerModels(mk).length;
    return { models, makers: DATA.makers.length };
  }, []);

  // Which tags actually appear (so we only show usable chips).
  const availableTags = useMemo(() => {
    const s = new Set<ModelTag>();
    for (const mk of DATA.makers)
      for (const m of makerModels(mk)) for (const t of m.tags) s.add(t);
    return TAG_ORDER.filter((t) => s.has(t));
  }, []);

  const passes = (m: ModelEntry) => {
    if (q && !matchModel(m, q)) return false;
    for (const t of tags) if (!m.tags.includes(t)) return false;
    return true;
  };

  const tree = useMemo<FilteredMaker[]>(() => {
    return DATA.makers
      .map((mk: ModelMaker, i): FilteredMaker => {
        const models = makerModels(mk).filter(passes);
        return {
          id: mk.id,
          title: mk.title,
          blurb: mk.blurb,
          accent: accentOf(i),
          count: models.length,
          models,
        };
      })
      .filter((mk) => mk.models.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tags]);

  const maker = tree.find((mk) => mk.id === sel.maker) ?? tree[0];
  const model = maker
    ? maker.models.find((m) => m.slug === sel.model) ?? maker.models[0]
    : undefined;

  // Version cards for the selected model (newest first). Fall back to a single
  // synthetic "current" entry if a model has no recorded version history.
  const versions: ModelVersion[] = useMemo(() => {
    if (!model) return [];
    if (model.versions?.length) return model.versions;
    return [{ version: model.name, date: model.releaseDate, current: true }];
  }, [model]);

  const navigate = (makerId: string, modelSlug: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("maker", makerId);
    params.set("model", modelSlug);
    window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    setSel({ maker: makerId, model: modelSlug });
  };
  const selectMaker = (id: string) => {
    const next = tree.find((mk) => mk.id === id);
    navigate(id, next?.models[0]?.slug ?? "");
  };
  const selectModel = (slug: string) => {
    if (maker) navigate(maker.id, slug);
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
      {/* One toolbar row: title · search · stats (mirrors the landscape bar) */}
      <div className="reg-bar">
        <h1 className="reg-title">
          LLM <span className="reg-title-accent">Registry</span>
        </h1>
        <label className="reg-search">
          <span className="reg-search-ic" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Filter models — name, version or license…"
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

      {!maker || !model ? (
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

          {/* Column 2 — the selected maker's models */}
          <div
            className="reg-mcol reg-mcol-models-nav"
            style={{ ["--cat" as string]: maker.accent }}
          >
            <div className="reg-msticky">
              <div className="reg-mhdr">{maker.title}</div>
              {maker.models.map((m) => (
                <button
                  key={m.slug}
                  type="button"
                  className={`reg-mrow${m.slug === model.slug ? " is-on" : ""}`}
                  onClick={() => selectModel(m.slug)}
                  aria-current={m.slug === model.slug}
                >
                  <span className="reg-mname">{m.name}</span>
                  {m.contextWindow && <span className="reg-mn">{m.contextWindow}</span>}
                  <span className="reg-marr" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3 — version timeline of the selected model, as cards */}
          <div
            className="reg-mcol reg-mcol-versions"
            style={{ ["--cat" as string]: maker.accent }}
          >
            <div className="reg-mhdr reg-mhdr-versions">
              <span className="reg-mhdr-title">{model.name}</span>
              <span className="reg-mhdr-sub">
                {maker.title} · {versions.length} version
                {versions.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="reg-vtiles">
              {versions.map((v, i) => (
                <VersionCard key={`${v.version}-${i}`} version={v} model={model} />
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="reg-note">
        A registry of large language models — frontier and open-weight. Pick a
        maker, then a model, to see its full version history; click the current
        release for specs, benchmarks, pricing and APIs. Numbers trace to
        verified sources and refresh as models ship.
      </p>
    </div>
  );
}
