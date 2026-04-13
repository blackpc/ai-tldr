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
  "overworld-waypoint-1-5",
  "coleam00-archon",
];
