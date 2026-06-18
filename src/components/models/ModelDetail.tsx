/**
 * /models/<slug> — a single LLM's detail page (Artificial-Analysis style):
 * specs, a benchmark graph, pricing, API providers, the full version lineage
 * and every useful link.
 *
 * CONSISTENCY: this page is built from the SAME layout primitives as a
 * /learn/landscape tool page and a Learn article (lrn-article → lrn-art-head +
 * lrn-tool-layout with a TOC rail and aside → lrn-section / lrn-h2 / lrn-p /
 * lrn-list / lrn-table / lrn-pn). It reuses those exact CSS classes — defined
 * once in learn.css, imported by the models chunk — so a model page can never
 * drift away from the landscape look. The only model-specific styles are the
 * benchmark chart bars (.mdl-chart*), the price emphasis (.mdl-price-*) and the
 * "current" pill in the version table (.mdl-cmp-badge), all additive in
 * models.css. Pure / SSR-safe — also rendered by prerender-models.tsx.
 */

import registryData from "../../data/models/registry.json";
import type {
  ModelRegistry,
  ModelDetail,
  ModelEntry,
  ModelLink,
  ModelLinkKind,
} from "../../data/models/schema";
import { modelPath } from "../../data/models/schema";

const DATA = registryData as ModelRegistry;

/** All versions of this model's LINE, newest-first (for comparison + nav). */
function lineVersions(detail: ModelDetail): ModelEntry[] {
  const mk = DATA.makers.find((m) => m.id === detail.maker);
  return mk?.lines.find((l) => l.id === detail.line)?.versions ?? [];
}

/** Newer = the next newer version, older = the next older version, within the
 *  line (the registry stores versions newest-first). */
function prevNext(detail: ModelDetail): { newer?: ModelEntry; older?: ModelEntry } {
  const vs = lineVersions(detail);
  const i = vs.findIndex((v) => v.slug === detail.slug);
  if (i < 0) return {};
  return { newer: i > 0 ? vs[i - 1] : undefined, older: i < vs.length - 1 ? vs[i + 1] : undefined };
}

/** Related models: other lines' current flagships from the same maker. */
function relatedModels(detail: ModelDetail): ModelEntry[] {
  const mk = DATA.makers.find((m) => m.id === detail.maker);
  const out: ModelEntry[] = [];
  for (const l of mk?.lines ?? []) {
    if (l.id === detail.line) continue;
    const head = l.versions.find((v) => v.current) ?? l.versions[0];
    if (head && head.slug !== detail.slug) out.push(head);
  }
  return out.slice(0, 6);
}

const LINK_GROUP_LABEL: Record<ModelLinkKind, string> = {
  official: "Official",
  "model-card": "Model card",
  "api-docs": "API docs",
  paper: "Paper",
  announcement: "Announcement",
  benchmark: "Benchmarks",
  review: "Reviews",
  tutorial: "Tutorials",
  playground: "Playground",
};
const LINK_GROUP_ORDER: ModelLinkKind[] = [
  "official", "model-card", "api-docs", "paper", "announcement",
  "playground", "benchmark", "review", "tutorial",
];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** True when the page has any benchmark content worth a "Benchmarks" section. */
function hasBenchmarks(detail: ModelDetail): boolean {
  return Boolean(
    detail.comparisonFigures?.length ||
      detail.comparisonTable?.rows?.length ||
      detail.benchmarks?.length,
  );
}

/** The maker's own published comparison chart(s), shown verbatim on a plate
 *  (same figure primitive as a Learn article image) with a credit + source. */
function ComparisonFigures({ detail }: { detail: ModelDetail }) {
  if (!detail.comparisonFigures?.length) return null;
  return (
    <>
      {detail.comparisonFigures.map((f, i) => (
        <figure className="lrn-image" key={i}>
          <a href={f.source} target="_blank" rel="noreferrer noopener">
            <img src={f.url} alt={f.alt} loading="lazy" />
          </a>
          <figcaption>
            {f.caption ?? f.alt}
            {f.credit && <span className="lrn-image-credit"> — {f.credit}</span>}
          </figcaption>
        </figure>
      ))}
    </>
  );
}

/** The published comparison transcribed as numbers — benchmarks down the side,
 *  models across the top, this model's column highlighted. Reuses the shared
 *  lrn-table/lrn-cmp look; the subject column gets .mdl-cmp-col. */
function ComparisonTable({ detail }: { detail: ModelDetail }) {
  const t = detail.comparisonTable;
  if (!t?.rows?.length) return null;
  const subj = t.subject;
  return (
    <div className="mdl-cmp-block">
      {t.caption && <p className="lrn-p">{t.caption}</p>}
      <div className="lrn-table-wrap">
        <table className="lrn-table lrn-cmp mdl-cmp-table">
          <thead>
            <tr>
              <th>Benchmark</th>
              {t.models.map((m, i) => (
                <th key={i} className={i === subj ? "mdl-cmp-col" : undefined}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r) => (
              <tr key={r.benchmark}>
                <td className="lrn-cmp-name">{r.benchmark}</td>
                {r.scores.map((s, i) => (
                  <td key={i} className={i === subj ? "mdl-cmp-col" : undefined}>
                    {s == null ? "—" : `${s}${!r.unit ? "" : r.unit === "%" ? "%" : ` ${r.unit}`}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lrn-p">
        <a href={t.source} target="_blank" rel="noreferrer noopener">
          Comparison source ↗
        </a>
      </p>
    </div>
  );
}

/** This model's own published scores as a gridded horizontal bar chart (0–100
 *  scale). An absolute scorecard — the comparison above is what sets it against
 *  peers; these bars link each number to its source. */
function BenchBars({ detail }: { detail: ModelDetail }) {
  if (!detail.benchmarks?.length) return null;
  const hasComparison = Boolean(
    detail.comparisonFigures?.length || detail.comparisonTable?.rows?.length,
  );
  return (
    <>
      {hasComparison && <h3 className="lrn-h3">This model&apos;s scores</h3>}
      <ol className="mdl-chart" aria-label="Benchmark scores">
        {detail.benchmarks.map((b) => {
          const max = b.max ?? 100;
          const unit = b.unit ?? "%";
          const w = Math.min(100, Math.max(0, (b.score / max) * 100));
          return (
            <li className="mdl-chart-row" key={b.name}>
              <a
                className="mdl-chart-name"
                href={b.source}
                target="_blank"
                rel="noreferrer noopener"
                title={`Source: ${hostOf(b.source)}`}
              >
                {b.name}
              </a>
              <span className="mdl-chart-track">
                <span className="mdl-chart-fill" style={{ width: `${w}%` }} aria-hidden="true" />
              </span>
              <span className="mdl-chart-val">
                {b.score}
                {unit}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mdl-chart-cap">
        Scores on a 0–100 scale (25-point gridlines); higher is better. Each
        benchmark links to its published source.
      </p>
    </>
  );
}

/** Benchmarks section: the maker's published comparison first (chart image
 *  and/or numeric table — this model against named peers), then this model's
 *  own absolute scores. Renders only if at least one of those exists. */
function BenchSection({ detail }: { detail: ModelDetail }) {
  if (!hasBenchmarks(detail)) return null;
  return (
    <section id="benchmarks" className="lrn-section" aria-labelledby="benchmarks-h">
      <h2 className="lrn-h2" id="benchmarks-h">
        <span className="lrn-h2-mark" aria-hidden="true">//</span> Benchmarks
      </h2>
      <ComparisonFigures detail={detail} />
      <ComparisonTable detail={detail} />
      <BenchBars detail={detail} />
    </section>
  );
}

export function ModelDetailPage({ detail }: { detail: ModelDetail }) {
  const related = relatedModels(detail);
  const versions = lineVersions(detail);
  const { newer, older } = prevNext(detail);
  const makerHref = `/models/?maker=${detail.maker}`;
  const lineHref = `/models/?maker=${detail.maker}&line=${detail.line}`;

  const specs: { k: string; v: string }[] = [];
  if (detail.releaseDate) specs.push({ k: "Released", v: detail.releaseDate });
  specs.push({ k: "License", v: detail.license });
  specs.push({ k: "Weights", v: detail.openWeights ? "Open weights" : "API only" });
  if (detail.parameters) specs.push({ k: "Parameters", v: detail.parameters });
  if (detail.contextWindow) specs.push({ k: "Context", v: detail.contextWindow });
  if (detail.maxOutput) specs.push({ k: "Max output", v: detail.maxOutput });
  if (detail.architecture) specs.push({ k: "Architecture", v: detail.architecture });
  if (detail.knowledgeCutoff) specs.push({ k: "Knowledge cutoff", v: detail.knowledgeCutoff });
  if (detail.modalities.length) specs.push({ k: "Modalities", v: detail.modalities.join(", ") });
  if (detail.status) specs.push({ k: "Status", v: detail.status });

  const toc = [
    { id: "overview", title: "Overview" },
    ...(hasBenchmarks(detail) ? [{ id: "benchmarks", title: "Benchmarks" }] : []),
    ...(detail.pricing ? [{ id: "pricing", title: "Pricing" }] : []),
    ...(detail.strengths.length ? [{ id: "strengths", title: "Strengths" }] : []),
    ...(detail.useCases.length ? [{ id: "use-cases", title: "Best for" }] : []),
    ...(detail.apis?.length ? [{ id: "access", title: "How to access" }] : []),
    ...(versions.length > 1 ? [{ id: "history", title: "Version history" }] : []),
    ...(detail.faq?.length ? [{ id: "faq", title: "FAQ" }] : []),
  ];

  // Aside links: a couple of primary buttons (official site, playground), the
  // rest as a compact reference list — ordered by kind for a stable layout.
  const orderIdx = (k: ModelLinkKind) => LINK_GROUP_ORDER.indexOf(k);
  const primaryLinks = [
    detail.links.find((l) => l.kind === "official"),
    detail.links.find((l) => l.kind === "playground"),
  ].filter((l): l is ModelLink => Boolean(l));
  const primaryUrls = new Set(primaryLinks.map((l) => l.url));
  const restLinks = detail.links
    .filter((l) => !primaryUrls.has(l.url))
    .sort((a, b) => orderIdx(a.kind) - orderIdx(b.kind));

  return (
    <article className="lrn-article">
      <header className="lrn-art-head">
        <nav className="lrn-crumbs" aria-label="Breadcrumb">
          <span className="lrn-crumb">
            <a href="/models/" data-internal="true">LLMS</a>
          </span>
          <span className="lrn-crumb">
            <span className="lrn-crumb-sep" aria-hidden="true">/</span>
            <a href={makerHref} data-internal="true">{detail.makerTitle}</a>
          </span>
          <span className="lrn-crumb">
            <span className="lrn-crumb-sep" aria-hidden="true">/</span>
            <a href={lineHref} data-internal="true">{detail.lineTitle}</a>
          </span>
          <span className="lrn-crumb">
            <span className="lrn-crumb-sep" aria-hidden="true">/</span>
            <span className="lrn-crumb-here" aria-current="page">{detail.name}</span>
          </span>
        </nav>
        <h1 className="lrn-art-title">{detail.name}</h1>
        <p className="lrn-art-tagline">{detail.tagline}</p>
      </header>

      <div className="lrn-tool-layout">
        <nav className="lrn-toc" aria-label="On this page">
          <span className="lrn-toc-h">// ON THIS PAGE</span>
          <ol>
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>{t.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lrn-art-content">
          <section id="overview" className="lrn-section" aria-labelledby="overview-h">
            <h2 className="lrn-h2" id="overview-h">
              <span className="lrn-h2-mark" aria-hidden="true">//</span> Overview
            </h2>
            {detail.overview.map((p, i) => (
              <p className="lrn-p" key={i}>{p}</p>
            ))}
            <div className="lrn-table-wrap">
              <table className="lrn-table">
                <tbody>
                  {specs.map((s) => (
                    <tr key={s.k}>
                      <th scope="row">{s.k}</th>
                      <td>{s.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <BenchSection detail={detail} />

          {detail.pricing && (
            <section id="pricing" className="lrn-section" aria-labelledby="pricing-h">
              <h2 className="lrn-h2" id="pricing-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> Pricing
              </h2>
              <div className="lrn-table-wrap">
                <table className="lrn-table">
                  <tbody>
                    {detail.pricing.input && (
                      <tr>
                        <th scope="row">Input</th>
                        <td>
                          <span className="mdl-price-amt">{detail.pricing.input}</span>{" "}
                          <span className="mdl-price-unit">{detail.pricing.unit ?? "/ 1M tokens"}</span>
                        </td>
                      </tr>
                    )}
                    {detail.pricing.cachedInput && (
                      <tr>
                        <th scope="row">Cached input</th>
                        <td>
                          <span className="mdl-price-amt">{detail.pricing.cachedInput}</span>{" "}
                          <span className="mdl-price-unit">{detail.pricing.unit ?? "/ 1M tokens"}</span>
                        </td>
                      </tr>
                    )}
                    {detail.pricing.output && (
                      <tr>
                        <th scope="row">Output</th>
                        <td>
                          <span className="mdl-price-amt">{detail.pricing.output}</span>{" "}
                          <span className="mdl-price-unit">{detail.pricing.unit ?? "/ 1M tokens"}</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {detail.pricing.note && <p className="lrn-p">{detail.pricing.note}</p>}
              <p className="lrn-p">
                <a href={detail.pricing.source} target="_blank" rel="noreferrer noopener">
                  Pricing source ↗
                </a>
              </p>
            </section>
          )}

          {detail.strengths.length > 0 && (
            <section id="strengths" className="lrn-section" aria-labelledby="strengths-h">
              <h2 className="lrn-h2" id="strengths-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> Strengths
              </h2>
              <ul className="lrn-list">
                {detail.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {detail.useCases.length > 0 && (
            <section id="use-cases" className="lrn-section" aria-labelledby="use-cases-h">
              <h2 className="lrn-h2" id="use-cases-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> Best for
              </h2>
              <ul className="lrn-list">
                {detail.useCases.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </section>
          )}

          {detail.apis && detail.apis.length > 0 && (
            <section id="access" className="lrn-section" aria-labelledby="access-h">
              <h2 className="lrn-h2" id="access-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> How to access
              </h2>
              <div className="lrn-table-wrap">
                <table className="lrn-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Model ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.apis.map((a) => (
                      <tr key={a.provider}>
                        <td>
                          <a href={a.url} target="_blank" rel="noreferrer noopener">
                            {a.provider} ↗
                          </a>
                        </td>
                        <td>{a.modelId ? <code>{a.modelId}</code> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {versions.length > 1 && (
            <section id="history" className="lrn-section" aria-labelledby="history-h">
              <h2 className="lrn-h2" id="history-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> {detail.lineTitle} — every version
              </h2>
              <p className="lrn-p">
                The full lineage of the {detail.lineTitle} line, newest first.
                Every version has its own page — click any to compare specs,
                benchmarks and pricing.
              </p>
              <div className="lrn-table-wrap">
                <table className="lrn-table lrn-cmp">
                  <thead>
                    <tr><th>Version</th><th>Released</th><th>Context</th><th>License</th></tr>
                  </thead>
                  <tbody>
                    {versions.map((v) => {
                      const isCur = v.slug === detail.slug;
                      return (
                        <tr key={v.slug} className={isCur ? "lrn-cmp-cur" : undefined}>
                          <td className="lrn-cmp-name">
                            {isCur ? (
                              <strong>{v.name}</strong>
                            ) : (
                              <a href={modelPath(v.slug)} data-internal="true">{v.name}</a>
                            )}
                            {v.current && <span className="mdl-cmp-badge">current</span>}
                          </td>
                          <td>{v.date ?? "—"}</td>
                          <td>{v.contextWindow ?? "—"}</td>
                          <td>{v.license ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {detail.faq && detail.faq.length > 0 && (
            <section id="faq" className="lrn-section lrn-faq" aria-labelledby="faq-h">
              <h2 className="lrn-h2" id="faq-h">
                <span className="lrn-h2-mark" aria-hidden="true">//</span> FAQ
              </h2>
              {detail.faq.map((f, i) => (
                <details className="lrn-faq-item" key={i}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </section>
          )}
        </div>

        <aside className="lrn-tool-aside" aria-label="Model details">
          {primaryLinks.length > 0 && (
            <div className="lrn-tool-links">
              {primaryLinks.map((l) => (
                <a
                  className="lrn-art-home"
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="lrn-art-home-kind">{LINK_GROUP_LABEL[l.kind].toUpperCase()}</span>
                  <span className="lrn-art-home-loc">{hostOf(l.url)}</span>
                  <span className="lrn-art-home-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}

          {restLinks.length > 0 && (
            <div className="lrn-tool-related">
              <span className="lrn-tool-aside-h">// LINKS</span>
              <ul>
                {restLinks.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      <span className="lrn-tool-related-name">{l.label}</span>
                      <span className="lrn-tool-related-stars">{hostOf(l.url)} ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {related.length > 0 && (
            <div className="lrn-tool-related">
              <span className="lrn-tool-aside-h">// MORE FROM {detail.makerTitle.toUpperCase()}</span>
              <ul>
                {related.map((m) => (
                  <li key={m.slug}>
                    <a href={modelPath(m.slug)} data-internal="true">
                      <span className="lrn-tool-related-name">{m.name}</span>
                      {m.contextWindow && (
                        <span className="lrn-tool-related-stars">{m.contextWindow}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <nav className="lrn-pn" aria-label="More versions in this line">
        {older ? (
          <a className="lrn-pn-link lrn-pn-prev" href={modelPath(older.slug)} data-internal="true">
            <span className="lrn-pn-dir">← OLDER VERSION</span>
            <span className="lrn-pn-title">{older.name}</span>
          </a>
        ) : (
          <a className="lrn-pn-link lrn-pn-prev" href="/models/" data-internal="true">
            <span className="lrn-pn-dir">← LLM REGISTRY</span>
            <span className="lrn-pn-title">All language models</span>
          </a>
        )}
        {newer ? (
          <a className="lrn-pn-link lrn-pn-next" href={modelPath(newer.slug)} data-internal="true">
            <span className="lrn-pn-dir">NEWER VERSION →</span>
            <span className="lrn-pn-title">{newer.name}</span>
          </a>
        ) : (
          <span className="lrn-pn-spacer" />
        )}
      </nav>
    </article>
  );
}
