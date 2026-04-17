/**
 * Editor's Choice — release IDs pinned to the top of the feed.
 *
 * Maintained by the release sweep agent (prompts/update-releases.md).
 * Reserved for very important or very interesting releases — cap 3–4
 * items at a time. When a better release ships, the agent rotates the
 * weakest pin out.
 *
 * Pinned items appear at the top of the feed regardless of date and
 * get a yellow "EDITOR'S CHOICE" swatch on their card. A human can
 * still edit this file by hand; the agent will respect existing picks
 * unless they fall below the bar.
 *
 * Each entry MUST keep its 1–2 line comment explaining *why* it's
 * pinned, so a reader of the diff can tell at a glance.
 */

export const EDITOR_CHOICE: readonly string[] = [
  // Anthropic's new flagship: 3x agentic coding throughput, 3.75MP vision, 128k output
  // tokens — at the same price as Opus 4.6. Step-change for long-horizon agent tasks.
  "anthropic-claude-opus-4-7",
];
