/**
 * "In the news" — feed items that NAME a catalogue entity (tool or LLM),
 * newest public date first. Shared by the tool page (LearnTool) and the
 * model page (models/ModelDetail). Consumes the slim GENERATED news refs
 * (tool-news.json / model-news.json) — never releases.json itself, so the
 * lazy learn/models chunks stay feed-free.
 * Pure / SSR-safe — also rendered by the prerenderers.
 */

import type { EntityNewsRef } from "../../lib/entities";

const IMPORTANCE_LABEL: Record<string, string> = {
  rumor: "RUMOR",
  notable: "NOTABLE",
  major: "MAJOR",
  seismic: "SEISMIC",
};

export function EntityNewsSection({
  name,
  news,
}: {
  name: string;
  news: EntityNewsRef[];
}) {
  if (news.length === 0) return null;
  return (
    <section id="news" className="lrn-section" aria-labelledby="news-h">
      <h2 className="lrn-h2" id="news-h">
        <span className="lrn-h2-mark" aria-hidden="true">//</span> {name} in the news
      </h2>
      <ol className="lrn-news">
        {news.map((it) => (
          <li className="lrn-news-item" key={it.id}>
            <span className="lrn-news-date">{it.date}</span>
            <span className={`lrn-news-imp lrn-news-imp-${it.importance}`}>
              {IMPORTANCE_LABEL[it.importance] ?? it.importance.toUpperCase()}
            </span>
            <a
              className="lrn-news-title"
              href={`/releases/${it.id}/`}
              data-internal="true"
            >
              {it.title}
            </a>
          </li>
        ))}
      </ol>
      <p className="lrn-p lrn-tool-src">
        From the <a href="/" data-internal="true">AI/TLDR release feed</a> —
        every item is source-verified when it ships.
      </p>
    </section>
  );
}
