import { useState } from "react";
import type { ReleaseItem } from "../data/schema";

/**
 * Renders an item's image with graceful fallback:
 *   - if no image is set in the data → fallback block
 *   - if the image fails to load (404, CORS, hotlink-block) → fallback block
 *
 * Fallback is a category-tinted block with the org name in big mono type.
 */
export function ReleaseImage({
  item,
  className,
}: {
  item: ReleaseItem;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const img = item.image;

  if (!img || errored) {
    return (
      <div
        className={`img-fallback ${className ?? ""}`}
        aria-hidden="true"
        data-org={item.org}
      >
        <span className="img-fallback-org">{item.org}</span>
      </div>
    );
  }

  return (
    <img
      className={`item-img ${className ?? ""}`}
      src={img.url}
      alt={img.alt}
      loading="lazy"
      decoding="async"
      style={{ objectFit: img.fit ?? "contain" }}
      onError={() => setErrored(true)}
    />
  );
}
