import { useMemo, useState } from "react";
import {
  influencers,
  PLATFORM_META,
  REACH_LABEL,
  CATEGORY_META,
  CATEGORY_ORDER,
  type Influencer,
  type Category,
} from "../data/influencers";
import { track } from "../lib/analytics";

/** Stable monogram colour from the id — deterministic so it never flickers. */
const MONO_HUES = [348, 28, 200, 152, 268, 92];
function monoHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return MONO_HUES[h % MONO_HUES.length];
}
function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function Avatar({ person }: { person: Influencer }) {
  const [failed, setFailed] = useState(false);
  if (!person.image || failed) {
    const hue = monoHue(person.id);
    return (
      <div
        className="inf-avatar inf-avatar-mono"
        style={{ ["--mono-hue" as string]: hue }}
        aria-hidden="true"
      >
        {initials(person.name)}
      </div>
    );
  }
  return (
    <img
      className="inf-avatar"
      src={person.image}
      alt={person.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function InfluencerCard({ person }: { person: Influencer }) {
  const meta = PLATFORM_META[person.platform];
  return (
    <a
      className={`inf-card inf-plat-${person.platform}`}
      href={person.url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() =>
        track("influencer:click", {
          id: person.id,
          platform: person.platform,
          category: person.category,
        })
      }
    >
      <Avatar person={person} />
      <div className="inf-body">
        <div className="inf-top">
          <span className={`badge inf-plat-badge plat-${person.platform}`}>
            {meta.icon} {meta.label}
          </span>
          {person.reach && (
            <span className="inf-reach" title="approximate audience">
              {REACH_LABEL[person.reach]}
            </span>
          )}
        </div>
        <h3 className="inf-name">{person.name}</h3>
        <span className="inf-handle">
          @{person.handle}
          {person.realName && (
            <span className="inf-realname"> · {person.realName}</span>
          )}
        </span>
        <p className="inf-bio">{person.bio}</p>
        <div className="inf-bottom">
          <div className="inf-tags">
            {person.tags.slice(0, 3).map((t) => (
              <span className="inf-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          {person.links && person.links.length > 0 && (
            <div className="inf-links">
              {person.links.map((l) => (
                <span
                  key={l.platform}
                  className="inf-link-icon"
                  title={PLATFORM_META[l.platform].label}
                >
                  {PLATFORM_META[l.platform].icon}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

export function InfluencersPage() {
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [query, setQuery] = useState("");

  // Pre-bucket by category once (the data is already ordered by reach
  // within each category).
  const byCategory = useMemo(() => {
    const map = new Map<Category, Influencer[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const p of influencers) map.get(p.category)!.push(p);
    return map;
  }, []);

  const q = query.trim().toLowerCase();
  const sections = useMemo(() => {
    return CATEGORY_ORDER.filter((c) => activeCat === null || c === activeCat)
      .map((cat) => {
        let list = byCategory.get(cat) ?? [];
        if (q) {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.handle.toLowerCase().includes(q) ||
              (p.realName?.toLowerCase().includes(q) ?? false) ||
              p.bio.toLowerCase().includes(q) ||
              p.tags.some((t) => t.includes(q)),
          );
        }
        return { cat, list };
      })
      .filter((s) => s.list.length > 0);
  }, [activeCat, q, byCategory]);

  const totalShown = sections.reduce((n, s) => n + s.list.length, 0);

  return (
    <>
      <div className="inf-header">
        <h1 className="inf-title">Top AI Influencers to Follow</h1>
        <span className="inf-subtitle">
          {influencers.length} people worth following · curated by role
        </span>
      </div>

      <div className="inf-filters">
        <div className="inf-chips">
          <button
            type="button"
            className={`chip ${activeCat === null ? "chip-on" : ""}`}
            onClick={() => setActiveCat(null)}
          >
            ALL <span className="chip-count">{influencers.length}</span>
          </button>
          {CATEGORY_ORDER.map((c) => {
            const count = byCategory.get(c)?.length ?? 0;
            if (count === 0) return null;
            return (
              <button
                type="button"
                key={c}
                className={`chip ${activeCat === c ? "chip-on" : ""}`}
                onClick={() => setActiveCat(activeCat === c ? null : c)}
              >
                {CATEGORY_META[c].chip}{" "}
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="search">
          <span className="search-prompt">/</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search name, handle, topic…"
            aria-label="Search influencers"
          />
        </div>
      </div>

      {totalShown === 0 ? (
        <div className="inf-empty">// no matches</div>
      ) : (
        sections.map(({ cat, list }) => (
          <section className="inf-section" key={cat}>
            <div className="inf-section-head">
              <h2 className="inf-section-title">{CATEGORY_META[cat].label}</h2>
              <span className="inf-section-count">{list.length}</span>
              <span className="inf-section-blurb">
                {CATEGORY_META[cat].blurb}
              </span>
            </div>
            <div className="inf-grid">
              {list.map((person) => (
                <InfluencerCard key={person.id} person={person} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
