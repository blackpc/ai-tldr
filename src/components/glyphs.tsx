/**
 * Shared single-color SVG glyphs (currentColor) used by the nav bar and the
 * catalogue link chips on release cards / the modal. One definition per
 * symbol so the "tools" icon on a card is EXACTLY the nav's AI Tools icon.
 * All are decorative (aria-hidden) — callers carry the accessible label.
 */

/** Lightning bolt — RELEASES (the live feed). */
export function ReleasesGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <polygon points="9.5,1 3.5,9 7.2,9 6.5,15 12.5,7 8.8,7" />
    </svg>
  );
}

/** Open book — LEARN. */
export function LearnGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 3.2C6.8 2.2 4.9 1.9 2.4 2v10.4c2.5-.1 4.4.2 5.6 1.2 1.2-1 3.1-1.3 5.6-1.2V2c-2.5-.1-4.4.2-5.6 1.2z" />
      <line x1="8" y1="3.4" x2="8" y2="13.2" />
    </svg>
  );
}

/** Wrench — AI TOOLS (also the card/modal "in our catalogue" tool chip). */
export function ToolsGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M13.8 4.2a3.6 3.6 0 0 1-4.8 4.4L4.6 13a1.55 1.55 0 0 1-2.2-2.2l4.4-4.4a3.6 3.6 0 0 1 4.4-4.8L8.9 3.9l.4 2.4 2.4.4 2.1-2.5z" />
    </svg>
  );
}

/** Chip — LLMS (also the card/modal model chip). */
export function LlmGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="8" height="8" />
      <rect x="6.6" y="6.6" width="2.8" height="2.8" fill="currentColor" stroke="none" />
      <line x1="6" y1="4" x2="6" y2="1.5" />
      <line x1="10" y1="4" x2="10" y2="1.5" />
      <line x1="6" y1="14.5" x2="6" y2="12" />
      <line x1="10" y1="14.5" x2="10" y2="12" />
      <line x1="4" y1="6" x2="1.5" y2="6" />
      <line x1="4" y1="10" x2="1.5" y2="10" />
      <line x1="14.5" y1="6" x2="12" y2="6" />
      <line x1="14.5" y1="10" x2="12" y2="10" />
    </svg>
  );
}

/** People — INFLUENCERS. */
export function InfluencersGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="5.6" cy="5" r="2.4" />
      <path d="M1.4 13.4c0-2.3 1.9-3.9 4.2-3.9s4.2 1.6 4.2 3.9z" />
      <circle cx="11.6" cy="4.6" r="1.9" opacity="0.72" />
      <path d="M10.2 9.2c.4-.1.9-.2 1.4-.2 1.9 0 3.4 1.3 3.4 3.2h-3.6c-.2-1.2-.7-2.2-1.2-3z" opacity="0.72" />
    </svg>
  );
}
