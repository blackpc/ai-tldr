/**
 * Block renderer for Learn article sections — the single place that turns
 * the fixed block vocabulary into markup, which is what keeps 300+ pages
 * visually identical. SSR-safe (used by prerender too).
 */

import { useState } from "react";
import type { LearnBlock } from "../../data/learn/schema";
import { renderInlineMd } from "./markdown";
import { highlight } from "./highlight";
import { Diagram } from "./Diagram";

function CodeBlock({
  lang,
  title,
  code,
}: {
  lang: string;
  title?: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const tokens = highlight(code, lang);
  return (
    <figure className="lrn-code">
      <figcaption className="lrn-code-head">
        <span className="lrn-code-title">{title ?? lang}</span>
        <span className="lrn-code-lang">{lang}</span>
        <button
          type="button"
          className="lrn-code-copy"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </figcaption>
      <pre>
        <code>
          {tokens.map((tok, i) =>
            tok.c ? (
              <span key={i} className={tok.c}>
                {tok.t}
              </span>
            ) : (
              tok.t
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}

const CALLOUT_LABEL = { tip: "TIP", warn: "WATCH OUT", note: "NOTE" } as const;

export function Block({ block }: { block: LearnBlock }) {
  switch (block.type) {
    case "p":
      return <p className="lrn-p">{renderInlineMd(block.md)}</p>;

    case "h3":
      return <h3 className="lrn-h3">{block.text}</h3>;

    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i}>{renderInlineMd(item)}</li>
      ));
      return block.ordered ? (
        <ol className="lrn-list">{items}</ol>
      ) : (
        <ul className="lrn-list">{items}</ul>
      );
    }

    case "table":
      return (
        <div className="lrn-table-wrap">
          <table className="lrn-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{renderInlineMd(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{renderInlineMd(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "code":
      return <CodeBlock lang={block.lang} title={block.title} code={block.code} />;

    case "callout":
      return (
        <aside className={`lrn-callout lrn-callout-${block.tone}`}>
          <span className="lrn-callout-label">
            {CALLOUT_LABEL[block.tone]}
          </span>
          <p>{renderInlineMd(block.md)}</p>
        </aside>
      );

    case "diagram":
      return <Diagram diagram={block.diagram} />;

    case "image":
      return (
        <figure className="lrn-image">
          <img src={block.url} alt={block.alt} loading="lazy" />
          {(block.caption || block.credit) && (
            <figcaption>
              {block.caption}
              {block.credit && (
                <span className="lrn-image-credit"> — {block.credit}</span>
              )}
            </figcaption>
          )}
        </figure>
      );
  }
}
