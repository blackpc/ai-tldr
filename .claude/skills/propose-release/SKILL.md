---
name: propose-release
description: Add a new release to AI/TLDR feed. Triggers when user says "add release", "publish release", "propose release", or similar with a release name/URL.
---

# Propose Release Skill

Triggers the `propose-release.yml` GitHub Actions workflow to research and add a new release to the AI/TLDR feed.

## When to use

Use this skill when the user asks to:
- "Add release X"
- "Publish release X"
- "Propose release X"
- "Add X to the feed"
- Any variation asking to add a specific release/tool/model/product

## How to trigger

Use the GitHub CLI to trigger the workflow:

```bash
# Basic proposal (not editor's choice)
gh workflow run propose-release.yml \
  -f proposal="<USER'S RELEASE NAME OR URL>" \
  -f editor_choice=false

# With Editor's Choice flag
gh workflow run propose-release.yml \
  -f proposal="<USER'S RELEASE NAME OR URL>" \
  -f editor_choice=true
```

## Parameters

- **proposal** (required): The release name, product name, or URL the user wants added
- **editor_choice** (optional, default: false): Set to `true` if user explicitly asks for Editor's Choice

## Workflow behavior

The workflow will:
1. Research the release using web search
2. Verify all URLs with WebFetch
3. Add it as the FIRST item in `src/data/releases.json`
4. If editor_choice=true, add to `src/data/editor-choice.ts` (max 4 items, oldest removed if overflow)
5. Run build to verify
6. Commit and push to master

## After triggering

1. Run the `gh workflow run` command
2. Tell the user the workflow has been triggered
3. Provide link to watch progress: https://github.com/blackpc/ai-tldr/actions/workflows/propose-release.yml

## Example

User: "Add release Claude Code 2.0 as editor's choice"

```bash
gh workflow run propose-release.yml \
  -f proposal="Claude Code 2.0" \
  -f editor_choice=true
```
