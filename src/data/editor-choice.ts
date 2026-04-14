/**
 * Editor's Choice — release IDs pinned to the top of the feed.
 *
 * This file is a HUMAN editorial decision, NOT agent output. The release
 * sweep agent (prompts/update-releases.md) owns `releases.json` and
 * `sweeps.json`; it does NOT touch this file. That's why it lives here
 * instead of inside `releases.json`: the agent rewrites that JSON on
 * every run and would clobber any pinned list.
 *
 * To pin or unpin a release, edit the array below by hand and commit.
 * Pinned items appear at the top of the feed regardless of date and
 * get a yellow "EDITOR'S CHOICE" swatch on their card.
 */

export const EDITOR_CHOICE: readonly string[] = [
  // Fixes one of the most tedious daily developer tasks — merge conflicts resolved
  // with 3 clicks, validated by the agent, and pushed automatically. This is the
  // kind of AI feature that saves real time every week.
  "github-copilot-cloud-agent-merge",
  // 44.5k stars in under a week — developers clearly want local-first AI memory.
  // MIT licensed, 96.6% on LongMemEval, works with Claude Code/Cursor/ChatGPT.
  // The method-of-loci organization is a clever UX touch.
  "mempalace-memory-system",
];
