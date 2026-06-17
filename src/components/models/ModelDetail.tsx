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

/** Sibling models in the same family (excluding the current one). */
function relatedModels(detail: ModelDetail): ModelEntry[] {
  const mk = DATA.makers.find((m) => m.id === detail.maker);
  const fam = mk?.families.find((f) => f.id === detail.family);
  const sibs = (fam?.models ?? []).filter((m) => m.slug !== detail.slug);
  if (sibs.length >= 2) return sibs.slice(0, 6);
  // top up with other models from the same maker
  const more = (mk?.families ?? [])
    .flatMap((f) => f.models)
    .filter((m) => m.slug !== detail.slug && !sibs.some((s) => s.slug === m.slug));
  return [...sibs, ...more].slice(0, 6);
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

function BenchBars({ detail }: { detail: ModelDetail }) {
  if (!detail.benchmarks?.length) return null;
  return (
    <section id="benchmarks" className="mdl-section" aria-labelledby="benchmarks-h">
      <h2 className="mdl-h2" id="benchmarks-h">
        <span className="mdl-h2-mark" aria-hidden="true">//</span> Benchmarks
      </h2>
      <table className="mdl-bench">
        <tbody>
          {detail.benchmarks.map((b) => {
            const max = b.max ?? 100;
            const unit = b.unit ?? "%";
            const w = Math.min(100, Math.max(0, (b.score / max) * 100));
            return (
              <tr key={b.name}>
                <th scope="row" className="mdl-bench-name">
                  <a href={b.source} target="_blank" rel="noreferrer noopener">
                    {b.name}
                  </a>
                </th>
                <td className="mdl-bench-bar">
                  <span className="mdl-bar" style={{ width: `${w}%` }} aria-hidden="true" />
                </td>
                <td className="mdl-bench-val">
                  {b.score}
                  {unit}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function ModelDetailPage({ detail }: { detail: ModelDetail }) {
  const related = relatedModels(detail);
  const makerHref = `/models/?maker=${detail.maker}&family=${detail.family}`;

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
    ...(detail.versionHistory?.length ? [{ id: "history", title: "Version history" }] : []),
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
          <span>{detail.name}</span>
        </nav>
        <h1 className="mdl-title">{detail.name}</h1>
        <p className="mdl-tagline">{detail.tagline}</p>
        <div className="mdl-tagrow">
          {detail.tags.map((t) => (
            <span className="mdl-tag" key={t}>{t}</span>
          ))}
        </div>
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

          <BenchBars detail={detail} />

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

          {detail.versionHistory && detail.versionHistory.length > 0 && (
            <section id="history" className="mdl-section" aria-labelledby="history-h">
              <h2 className="mdl-h2" id="history-h">
                <span className="mdl-h2-mark" aria-hidden="true">//</span> Version history
              </h2>
              <ol className="mdl-history">
                {detail.versionHistory.map((v, i) => (
                  <li key={i} className={v.current ? "mdl-hist-cur" : undefined}>
                    <span className="mdl-hist-ver">{v.version}</span>
                    {v.date && <span className="mdl-hist-date">{v.date}</span>}
                    {v.note && <span className="mdl-hist-note">{v.note}</span>}
                  </li>
                ))}
              </ol>
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
