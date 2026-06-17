/**
 * /stats — the AI Release Index. An original, recurring dataset built from
 * the verified feed + open-source landscape: a citation magnet (a unique
 * number forces attribution) and a GEO/AEO asset (extractable one-sentence
 * stats + ranked tables). Every figure is precomputed at build time into
 * stats.json (no landscape import in the main bundle) and recomputed each
 * build, so it tracks the sweep. Zero hallucination — all derived data.
 *
 * SSR-safe: rendered to static HTML by scripts/prerender.ts via
 * renderToStaticMarkup, then replaced on hydration. Plain <a href> links.
 */
import type { StatsData } from "../data/stats";

const NF = new Intl.NumberFormat("en-US");
const fmt = (n: number) => NF.format(n);

function formatStars(n: number): string {
  if (n < 1000) return String(n);
  if (n < 100000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n / 1000)}k`;
}

const CATEGORY_LABEL: Record<string, string> = {
  model: "Models",
  tool: "Tools",
  repo: "Repos",
  ecosystem: "Ecosystem",
  security: "Security",
  article: "Articles",
  paper: "Papers",
  video: "Video",
  benchmark: "Benchmarks",
  dataset: "Datasets",
  algorithm: "Algorithms",
  tutorial: "Tutorials",
  showcase: "Showcases",
  resource: "Resources",
  rumor: "Rumors",
};
const catLabel = (c: string) => CATEGORY_LABEL[c] ?? c.charAt(0).toUpperCase() + c.slice(1);

const IMPORTANCE_LABEL: Record<string, string> = {
  seismic: "Seismic",
  major: "Major",
  notable: "Notable",
  rumor: "Rumor",
};

/** "A, B and C" — used for the extractable takeaway sentences. */
function andList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function StatsPage({ data }: { data: StatsData }) {
  const t = data.totals;
  const cards: { value: number; label: string; sub: string }[] = [
    { value: t.releases, label: "releases tracked", sub: "verified, all-time" },
    { value: t.thisWeek, label: "in the last 7 days", sub: "fresh this week" },
    { value: t.thisMonth, label: "in the last 30 days", sub: "this month" },
    { value: t.ossTools, label: "open-source tools", sub: "in the landscape" },
    { value: t.labs, label: "distinct sources", sub: "labs & creators" },
    { value: t.learnArticles, label: "learn articles", sub: "AI encyclopedia" },
  ];

  const maxLab = Math.max(...data.topLabs.map((l) => l.count), 1);
  const maxCat = Math.max(...data.byCategory.map((c) => c.count), 1);
  const maxWeek = Math.max(...data.perWeek.map((w) => w.count), 1);
  const maxImp = Math.max(...data.byImportance.map((i) => i.count), 1);
  const maxStars = Math.max(...data.topTools.map((x) => x.stars), 1);

  const [lab1, lab2, lab3] = data.topLabs;
  const topCat = data.byCategory[0];
  const topTool = data.topTools[0];
  const last4 = data.perWeek.slice(-4).reduce((n, w) => n + w.count, 0);

  return (
    <main className="stx" aria-label="AI Release Index">
      <header className="stx-head">
        <nav className="stx-crumbs" aria-label="Breadcrumb">
          <a href="/">AI/TLDR</a>
          <span aria-hidden="true"> › </span>
          <span aria-current="page">AI Release Index</span>
        </nav>
        <h1 className="stx-title">AI Release Index</h1>
        <p className="stx-tagline">
          Live statistics on the AI releases and open-source tools AI/TLDR
          tracks — every figure derived from the verified feed.
        </p>
        <span className="stx-updated">UPDATED {data.generatedAt}</span>
      </header>

      <section className="stx-cards" aria-label="Headline numbers">
        {cards.map((c) => (
          <div className="stx-card" key={c.label}>
            <span className="stx-card-num">{fmt(c.value)}</span>
            <span className="stx-card-lbl">{c.label}</span>
            <span className="stx-card-sub">{c.sub}</span>
          </div>
        ))}
      </section>

      <section className="stx-block" aria-labelledby="stx-labs">
        <h2 className="stx-h2" id="stx-labs">
          Which labs ship the most AI releases?
        </h2>
        {lab1 && lab2 && lab3 && (
          <p className="stx-take">
            <strong>{lab1.name}</strong> leads with {lab1.count} tracked
            releases, ahead of {lab2.name} ({lab2.count}) and {lab3.name} (
            {lab3.count}).
          </p>
        )}
        <table className="stx-table">
          <thead>
            <tr>
              <th className="stx-rank">#</th>
              <th>Lab / source</th>
              <th className="stx-num">Releases</th>
              <th className="stx-barcol" aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {data.topLabs.map((l, i) => (
              <tr key={l.name}>
                <td className="stx-rank">{i + 1}</td>
                <td>{l.name}</td>
                <td className="stx-num">{l.count}</td>
                <td className="stx-barcol">
                  <span
                    className="stx-bar"
                    style={{ width: `${(l.count / maxLab) * 100}%` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="stx-block" aria-labelledby="stx-cats">
        <h2 className="stx-h2" id="stx-cats">
          What kinds of releases dominate?
        </h2>
        {topCat && (
          <p className="stx-take">
            {catLabel(topCat.category)} are the largest category (
            {topCat.count}), out of{" "}
            {andList(
              data.byCategory
                .slice(1, 4)
                .map((c) => `${catLabel(c.category).toLowerCase()} (${c.count})`),
            )}
            .
          </p>
        )}
        <ul className="stx-bars">
          {data.byCategory.map((c) => (
            <li className="stx-bars-row" key={c.category}>
              <span className="stx-bars-lbl">{catLabel(c.category)}</span>
              <span className="stx-bars-track">
                <span
                  className="stx-bar"
                  style={{ width: `${(c.count / maxCat) * 100}%` }}
                />
              </span>
              <span className="stx-bars-num">{c.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stx-block" aria-labelledby="stx-cadence">
        <h2 className="stx-h2" id="stx-cadence">
          How fast is AI shipping?
        </h2>
        <p className="stx-take">
          {last4} releases landed in the last 4 weeks, {t.thisWeek} of them in
          the last 7 days.
        </p>
        <div className="stx-spark" role="img" aria-label="Releases per week, last 12 weeks">
          {data.perWeek.map((w) => (
            <span className="stx-spark-col" key={w.weekStart} title={`${w.weekStart}: ${w.count}`}>
              <span className="stx-spark-bar" style={{ height: `${(w.count / maxWeek) * 100}%` }} />
              <span className="stx-spark-x">{w.weekStart.slice(5)}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="stx-block" aria-labelledby="stx-imp">
        <h2 className="stx-h2" id="stx-imp">
          How big are the releases?
        </h2>
        <ul className="stx-bars">
          {data.byImportance.map((im) => (
            <li className="stx-bars-row" key={im.importance}>
              <span className="stx-bars-lbl">
                {IMPORTANCE_LABEL[im.importance] ?? im.importance}
              </span>
              <span className="stx-bars-track">
                <span
                  className={`stx-bar stx-bar-${im.importance}`}
                  style={{ width: `${(im.count / maxImp) * 100}%` }}
                />
              </span>
              <span className="stx-bars-num">{im.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stx-block" aria-labelledby="stx-tools">
        <h2 className="stx-h2" id="stx-tools">
          Most-starred open-source AI tools
        </h2>
        {topTool && (
          <p className="stx-take">
            <strong>{topTool.name}</strong> leads the tracked open-source
            landscape with {formatStars(topTool.stars)} GitHub stars.
          </p>
        )}
        <table className="stx-table">
          <thead>
            <tr>
              <th className="stx-rank">#</th>
              <th>Tool</th>
              <th>Category</th>
              <th className="stx-num">Stars</th>
              <th className="stx-barcol" aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {data.topTools.map((tool, i) => (
              <tr key={tool.slug}>
                <td className="stx-rank">{i + 1}</td>
                <td>
                  <a href={`/learn/landscape/${tool.slug}`}>{tool.name}</a>
                </td>
                <td className="stx-cat">{tool.category}</td>
                <td className="stx-num">{formatStars(tool.stars)}</td>
                <td className="stx-barcol">
                  <span
                    className="stx-bar stx-bar-star"
                    style={{ width: `${(tool.stars / maxStars) * 100}%` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="stx-more">
          <a href="/learn/landscape/">Explore the full open-source AI landscape →</a>
        </p>
      </section>

      <footer className="stx-method">
        <p>
          Derived from {fmt(t.releases)} verified releases and {fmt(t.ossTools)}{" "}
          open-source tools that AI/TLDR tracks. Recomputed on every build, so
          it tracks the feed. Updated {data.generatedAt}.
        </p>
        <p className="stx-back">
          <a href="/">← All releases</a> · <a href="/learn/">Learn AI</a>
        </p>
      </footer>
    </main>
  );
}
