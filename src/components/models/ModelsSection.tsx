/**
 * Client entry for the /models LLM registry — the ONLY file the SPA imports
 * (lazily, via React.lazy in App.tsx), so the whole registry + per-model
 * detail chunks + CSS ship separately from the feed bundle.
 *
 * Owns: per-model JSON loading (vite glob chunks), title/description/canonical
 * sync, and pushState interception for internal links.
 */

import { useEffect, useMemo, useState } from "react";
// The model DETAIL page reuses the landscape/article layout primitives
// (lrn-article, lrn-tool-layout, lrn-section, lrn-h2, lrn-table, lrn-pn …) so
// it shares the EXACT same styling as /learn/landscape and can't drift. Those
// rules live in learn.css, so the models chunk imports it. No class names
// collide (registry board uses reg-*, detail extras use mdl-*).
import "../learn/learn.css";
import "./models.css";

import type { ModelDetail } from "../../data/models/schema";
import { modelPath } from "../../data/models/schema";
import { ModelsRegistryPage } from "./ModelsRegistry";
import { ModelDetailPage } from "./ModelDetail";

export type ModelsRoute =
  | { kind: "models" }
  | { kind: "model"; slug: string };

// Each model detail JSON is its own lazy vite chunk; key by slug (basename).
const modelModules = import.meta.glob<{ default: ModelDetail }>(
  "../../data/models/models/*.json",
);
const modelLoaders = new Map<string, () => Promise<{ default: ModelDetail }>>();
for (const [path, loader] of Object.entries(modelModules)) {
  const slug = path.split("/").pop()!.replace(/\.json$/, "");
  modelLoaders.set(slug, loader);
}

/** Prerendered pages embed the detail JSON so the SPA's first render matches
 *  the static HTML without waiting for the chunk fetch. */
function embeddedModel(slug: string): ModelDetail | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById("__MODELS_DATA__");
  if (!el?.textContent) return null;
  try {
    const data = JSON.parse(el.textContent) as ModelDetail;
    return data.slug === slug && Array.isArray(data.overview) ? data : null;
  } catch {
    return null;
  }
}

function setPageMeta(title: string, description: string, path: string) {
  document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", description);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", `https://ai-tldr.dev${path}`);
}

function NotFound() {
  return (
    <div className="reg-page">
      <h1 className="reg-title">404 // MODEL NOT FOUND</h1>
      <p className="reg-note">
        No such model.{" "}
        <a href="/models/" data-internal="true">Back to the LLM registry →</a>
      </p>
    </div>
  );
}

function ModelDetailView({ slug }: { slug: string }) {
  const [detail, setDetail] = useState<ModelDetail | null>(() => embeddedModel(slug));

  useEffect(() => {
    if (detail?.slug === slug) return;
    setDetail(null);
    const loader = modelLoaders.get(slug);
    if (!loader) return;
    let cancelled = false;
    loader().then((mod) => {
      if (!cancelled) setDetail(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, detail]);

  useEffect(() => {
    if (detail?.slug === slug)
      setPageMeta(`${detail.seoTitle} | AI/TLDR`, detail.metaDescription, modelPath(slug));
  }, [detail, slug]);

  if (!modelLoaders.has(slug)) return <NotFound />;
  if (!detail) {
    return (
      <div className="reg-page">
        <div className="reg-loading">// loading…</div>
      </div>
    );
  }
  return <ModelDetailPage detail={detail} />;
}

export default function ModelsSection({
  route,
  onNavigate,
}: {
  route: ModelsRoute;
  onNavigate: (path: string) => void;
}) {
  useEffect(() => {
    if (route.kind === "models") {
      setPageMeta(
        "LLM Registry — Compare AI Models, Benchmarks & Pricing | AI/TLDR",
        "A browsable registry of large language models — frontier and open-weight — with verified specs, benchmarks, pricing and APIs. Filter by maker, family and capability.",
        "/models/",
      );
    }
    // model-detail meta is set by ModelDetailView once the chunk loads.
  }, [route]);

  const onClick = useMemo(
    () => (e: React.MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const a = target.closest("a[data-internal]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      onNavigate(href);
    },
    [onNavigate],
  );

  return (
    <main className="reg-main" onClick={onClick}>
      {route.kind === "models" ? (
        <ModelsRegistryPage />
      ) : (
        <ModelDetailView slug={route.slug} />
      )}
    </main>
  );
}
