/**
 * Catalogue cross-link UI for feed items:
 *
 *   <EntityChips>  — small bordered chips ("🔧 vLLM", "▣ GPT-5.5") linking a
 *                    release to the tool / model pages it names. Rendered on
 *                    the card (compact) and in the modal (full row). Plain
 *                    <a> navigation on purpose: the destinations are
 *                    prerendered static pages, and a full load keeps the
 *                    card's own click-to-open behaviour untangled
 *                    (stopPropagation gates the card handler).
 *
 *   <LinkedProse>  — renders PRE-COMPUTED prose segments (linkifyProse
 *                    output). The caller computes all segments for a page in
 *                    ONE pass with a local `used` set — computing inside this
 *                    component with a shared mutable set breaks under React
 *                    StrictMode's double render (second pass sees every
 *                    entity as already used and links nothing).
 *
 * Matching comes from src/lib/entities.ts — the same logic the prerenderer
 * uses, so the live SPA and the static release pages link identically.
 */

import type { ReleaseItem } from "../data/schema";
import type { LinkEntity, ProseSegment } from "../lib/entities";
import { ToolsGlyph, LlmGlyph } from "./glyphs";
import { track } from "../lib/analytics";

export function EntityChips({
  item,
  entities,
  source,
  max,
}: {
  item: ReleaseItem;
  entities: LinkEntity[];
  source: "card" | "modal";
  max?: number;
}) {
  const shown = max ? entities.slice(0, max) : entities;
  if (shown.length === 0) return null;
  return (
    <div
      className={`entity-chips entity-chips-${source}`}
      aria-label="In our catalogue"
    >
      {shown.map((e) => (
        <a
          key={e.key}
          className={`entity-chip entity-chip-${e.kind}`}
          href={e.href}
          title={
            e.kind === "tool"
              ? `${e.name} in the AI Tools catalogue`
              : `${e.name} in the LLM registry`
          }
          onClick={(ev) => {
            ev.stopPropagation();
            track("entity:click", {
              id: item.id,
              kind: e.kind,
              slug: e.slug,
              source,
            });
          }}
          onKeyDown={(ev) => ev.stopPropagation()}
        >
          <span className="entity-chip-ic" aria-hidden="true">
            {e.kind === "tool" ? <ToolsGlyph /> : <LlmGlyph />}
          </span>
          <span className="entity-chip-name">{e.name}</span>
        </a>
      ))}
    </div>
  );
}

export function LinkedProse({ segments }: { segments: ProseSegment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.href ? (
          <a key={i} className="entity-inline" href={s.href}>
            {s.text}
          </a>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
