/**
 * /models/<slug> — a single LLM's detail page (Artificial-Analysis style):
 * specs, benchmark bars, pricing, API providers, and every useful link.
 * Pure / SSR-safe — also rendered by prerender-models.tsx.
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

/** Prev = the next newer version, next = the next older version, within the
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

/** Benchmark scores as a gridded horizontal bar chart (0–100 scale, 25-point
 *  gridlines). Each row links to its source. */
function BenchChart({ detail }: { detail: ModelDetail }) {
  if (!detail.benchmarks?.length) return null;
  return (
    <section id="benchmarks" className="mdl-section" aria-labelledby="benchmarks-h">
      <h2 className="mdl-h2" id="benchmarks-h">
        <span className="mdl-h2-mark" aria-hidden="true">//</span> Benchmarks
      </h2>
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
    ...(detail.benchmarks?.length ? [{ id: "benchmarks", title: "Benchmarks" }] : []),
    ...(detail.pricing ? [{ id: "pricing", title: "Pricing" }] : []),
    ...(detail.strengths.length ? [{ id: "strengths", title: "Strengths" }] : []),
    ...(detail.useCases.length ? [{ id: "use-cases", title: "Best for" }] : []),
    ...(detail.apis?.length ? [{ id: "access", title: "How to access" }] : []),
    ...(versions.length > 1 || detail.versionHistory?.length
      ? [{ id: "history", title: "Version history" }]
      : []),
    ...(detail.faq?.length ? [{ id: "faq", title: "FAQ" }] : []),
  ];

  const linksByKind = LINK_GROUP_ORDER
    .map((kind) => ({ kind, links: detail.links.filter((l) => l.kind === kind) }))
    .filter((g) => g.links.length > 0);

  return (
    <article className="mdl-article">
      <header className="mdl-head">
        <nav className="mdl-crumbs" aria-label="Breadcrumb">
          <a href="/models/" data-internal="true">MODELS</a>
          <span aria-hidden="true"> › </span>
          <a href={makerHref} data-internal="true">{detail.makerTitle}</a>
          <span aria-hidden="true"> › </span>
          <a href={lineHref} data-internal="true">{detail.lineTitle}</a>
          <span aria-hidden="true"> › </span>
          <span>{detail.name}</span>
        </nav>
        <h1 className="mdl-title">{detail.name}</h1>
        <p className="mdl-tagline">{detail.tagline}</p>
        <div className="mdl-tagrow">
          {detail.tags.map((t) => (
            <span className="mdl-tag" key={t}>{t}</span>
          ))}
        </div>
        {(newer || older) && (
          <div className="mdl-vnav" aria-label="Adjacent versions in this line">
            {newer ? (
              <a className="mdl-vnav-link" href={modelPath(newer.slug)} data-internal="true">
                <span className="mdl-vnav-dir">← newer</span>
                <span className="mdl-vnav-name">{newer.name}</span>
              </a>
            ) : <span />}
            {older ? (
              <a className="mdl-vnav-link mdl-vnav-older" href={modelPath(older.slug)} data-internal="true">
                <span className="mdl-vnav-dir">older →</span>
                <span className="mdl-vnav-name">{older.name}</span>
              </a>
            ) : <span />}
          </div>
        )}
      </header>

      <div className="mdl-layout">
        <nav className="mdl-toc" aria-label="On this page">
          <span className="mdl-toc-h">// ON THIS PAGE</span>
          <ol>
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>{t.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mdl-content">
          <section id="overview" className="mdl-section" aria-labelledby="overview-h">
            <h2 className="mdl-h2" id="overview-h">
              <span className="mdl-h2-mark" aria-hidden="true">//</span> Overview
            </h2>
            {detail.overview.map((p, i) => (
              <p className="mdl-p" key={i}>{p}</p>
            ))}
            <table className="mdl-specs">
              <tbody>
                {specs.map((s) => (
                  <tr key={s.k}>
                    <th scope="row">{s.k}</th>
                    <td>{s.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <BenchChart detail={detail} />

          {detail.pricing && (
            <section id="pricing" className="mdl-section" aria-labelledby="pricing-h">
              <h2 className="mdl-h2" id="pricing-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> Pricing
              </h2>
              <table className="mdl-pricing">
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
              {detail.pricing.note && <p className="mdl-p mdl-fine">{detail.pricing.note}</p>}
              <a
                className="mdl-src"
                href={detail.pricing.source}
                target="_blank"
                rel="noreferrer noopener"
              >
                pricing source ↗
              </a>
            </section>
          )}

          {detail.strengths.length > 0 && (
            <section id="strengths" className="mdl-section" aria-labelledby="strengths-h">
              <h2 className="mdl-h2" id="strengths-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> Strengths
              </h2>
              <ul className="mdl-list">
                {detail.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {detail.useCases.length > 0 && (
            <section id="use-cases" className="mdl-section" aria-labelledby="use-cases-h">
              <h2 className="mdl-h2" id="use-cases-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> Best for
              </h2>
              <ul className="mdl-list">
                {detail.useCases.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </section>
          )}

          {detail.apis && detail.apis.length > 0 && (
            <section id="access" className="mdl-section" aria-labelledby="access-h">
              <h2 className="mdl-h2" id="access-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> How to access
              </h2>
              <table className="mdl-apis">
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
                      <td>{a.modelId ? <code className="mdl-code">{a.modelId}</code> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {versions.length > 1 && (
            <section id="history" className="mdl-section" aria-labelledby="history-h">
              <h2 className="mdl-h2" id="history-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> {detail.lineTitle} — every version
              </h2>
              <p className="mdl-p mdl-fine">
                The full lineage of the {detail.lineTitle} line, newest first.
                Every version has its own page — click any to compare specs,
                benchmarks and pricing.
              </p>
              <div className="mdl-cmp-wrap">
                <table className="mdl-cmp">
                  <thead>
                    <tr><th>Version</th><th>Released</th><th>Context</th><th>License</th></tr>
                  </thead>
                  <tbody>
                    {versions.map((v) => {
                      const isCur = v.slug === detail.slug;
                      return (
                        <tr key={v.slug} className={isCur ? "mdl-cmp-cur" : undefined}>
                          <th scope="row">
                            {isCur ? (
                              <span className="mdl-cmp-self">{v.name}</span>
                            ) : (
                              <a href={modelPath(v.slug)} data-internal="true">{v.name}</a>
                            )}
                            {v.current && <span className="mdl-cmp-badge">current</span>}
                          </th>
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
            <section id="faq" className="mdl-section" aria-labelledby="faq-h">
              <h2 className="mdl-h2" id="faq-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> FAQ
              </h2>
              <dl className="mdl-faq">
                {detail.faq.map((f, i) => (
                  <div className="mdl-faq-item" key={i}>
                    <dt>{f.q}</dt>
                    <dd>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="mdl-aside" aria-label="Model links">
          {linksByKind.map((g) => (
            <div className="mdl-links-group" key={g.kind}>
              <span className="mdl-aside-h">// {LINK_GROUP_LABEL[g.kind].toUpperCase()}</span>
              <ul>
                {g.links.map((l: ModelLink) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noreferrer noopener">
                      <span className="mdl-link-label">{l.label}</span>
                      <span className="mdl-link-host">{hostOf(l.url)} ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {related.length > 0 && (
            <div className="mdl-related">
              <span className="mdl-aside-h">// MORE FROM {detail.makerTitle.toUpperCase()}</span>
              <ul>
                {related.map((m) => (
                  <li key={m.slug}>
                    <a href={modelPath(m.slug)} data-internal="true">
                      <span className="mdl-related-name">{m.name}</span>
                      {m.contextWindow && (
                        <span className="mdl-related-ctx">{m.contextWindow}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <nav className="mdl-pn" aria-label="Back to the registry">
        <a className="mdl-pn-link" href="/models/" data-internal="true">
          <span className="mdl-pn-dir">← LLM REGISTRY</span>
          <span className="mdl-pn-title">All language models — specs, benchmarks &amp; pricing</span>
        </a>
      </nav>
    </article>
  );
}
