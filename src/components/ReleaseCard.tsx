import type { ReleaseItem } from "../data/schema";
import { CATEGORY_META } from "../data/categories";
import { ReleaseImage } from "./ReleaseImage";
import { CardShareButton } from "./CardShareButton";
import { CardAskAIButton } from "./CardAskAIButton";
import { track } from "../lib/analytics";

const importanceLabel: Record<ReleaseItem["importance"], string> = {
  rumor: "RUMOR",
  notable: "NOTABLE",
  major: "MAJOR",
  seismic: "SEISMIC",
};

// Show the actual release date from the source — when the thing
// actually shipped, like every other news site. publishDate is
// internal bookkeeping and not surfaced.

export function ReleaseCard({
  item,
  onOpen,
}: {
  item: ReleaseItem;
  onOpen: (item: ReleaseItem) => void;
}) {
  const displayDate = item.date;

  return (
    <article
      className={`card card-${item.importance}`}
      data-importance={item.importance}
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      aria-label={`${item.title} — ${item.org}`}
    >
      <CardShareButton item={item} />
      <CardAskAIButton item={item} />

      <a
        className="card-visit"
        href={item.url}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => {
          e.stopPropagation();
          track("release:url-click", {
            id: item.id,
            category: item.categories[0],
            source: "card",
          });
        }}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={`Open ${item.title} source in new tab`}
        title="Open source ↗"
      >
        ↗
      </a>

      <ReleaseImage item={item} className="card-img" />

      <div className="card-meta">
        {item.categories.map((c) => (
          <span className="badge badge-cat" key={c}>
            {CATEGORY_META[c].label}
          </span>
        ))}
        <span className={`badge badge-imp imp-${item.importance}`}>
          {importanceLabel[item.importance]}
        </span>
        <span className="card-date" title="Publish date">{displayDate}</span>
      </div>

      <h2 className="card-title">{item.title}</h2>

      <p className="card-tagline">{item.explainer.tagline}</p>

      {item.importance === "seismic" && (
        <p className="card-preview">
          {item.explainer.whatIsIt.split(/(?<=\.)\s+/).slice(0, 2).join(" ")}
        </p>
      )}

      <div className="card-foot">
        <span className="card-org">{item.org}</span>
        <span className="card-srclinks">
          {item.links?.length ?? 0} source{(item.links?.length ?? 0) === 1 ? "" : "s"}
        </span>
        <span className="card-cta">DETAILS →</span>
      </div>
    </article>
  );
}
