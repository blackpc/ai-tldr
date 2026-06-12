/**
 * Renders the Learn diagram DSL (see src/data/learn/schema.ts) as styled,
 * responsive HTML — brutalist boxes + arrow glyphs, no SVG layout math.
 * Flow arrows rotate from → to ↓ on narrow screens via CSS only.
 *
 * SSR-safe: pure presentational markup.
 */

import type { LearnDiagram, LearnDiagramNode } from "../../data/learn/schema";

// Defensive: tolerate a node supplied as a bare string (normalize to a
// label-only node). Guards against the `"str".sub` === String.prototype.sub
// trap, where a string node would otherwise render a function child.
function Node({ node }: { node: LearnDiagramNode | string }) {
  const n: LearnDiagramNode =
    typeof node === "string" ? { label: node } : node;
  return (
    <span className={`lrn-dg-node ${n.accent ? "lrn-dg-accent" : ""}`}>
      <span className="lrn-dg-label">{n.label}</span>
      {typeof n.sub === "string" && n.sub && (
        <span className="lrn-dg-sub">{n.sub}</span>
      )}
    </span>
  );
}

function Frame({
  title,
  kind,
  children,
}: {
  title?: string;
  kind: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={`lrn-diagram lrn-dg-${kind}`} role="img" aria-label={title}>
      {title && <figcaption className="lrn-dg-title">// {title}</figcaption>}
      <div className="lrn-dg-body">{children}</div>
    </figure>
  );
}

export function Diagram({ diagram }: { diagram: LearnDiagram }) {
  switch (diagram.kind) {
    case "flow":
      return (
        <Frame title={diagram.title} kind="flow">
          {diagram.steps.map((s, i) => (
            <span className="lrn-dg-step" key={i}>
              {i > 0 && <span className="lrn-dg-arrow" aria-hidden="true" />}
              <Node node={s} />
            </span>
          ))}
        </Frame>
      );

    case "cycle":
      return (
        <Frame title={diagram.title} kind="cycle">
          {diagram.steps.map((s, i) => (
            <span className="lrn-dg-step" key={i}>
              {i > 0 && <span className="lrn-dg-arrow" aria-hidden="true" />}
              <Node node={s} />
            </span>
          ))}
          <span className="lrn-dg-loop" aria-label="repeats">
            ↺ repeat
          </span>
        </Frame>
      );

    case "compare":
      return (
        <Frame title={diagram.title} kind="compare">
          {diagram.columns.map((col, i) => (
            <div
              className={`lrn-dg-col ${col.accent ? "lrn-dg-accent" : ""}`}
              key={i}
            >
              <span className="lrn-dg-col-title">{col.title}</span>
              <ul className="lrn-dg-col-items">
                {col.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </Frame>
      );

    case "stack":
      return (
        <Frame title={diagram.title} kind="stack">
          {diagram.layers.map((l, i) => (
            <Node node={l} key={i} />
          ))}
        </Frame>
      );

    case "split":
      return (
        <Frame title={diagram.title} kind="split">
          <div className="lrn-dg-split-root">
            <Node node={diagram.root} />
          </div>
          <div className="lrn-dg-split-children">
            {diagram.children.map((c, i) => (
              <div className="lrn-dg-split-child" key={i}>
                <Node node={c} />
              </div>
            ))}
          </div>
        </Frame>
      );
  }
}
