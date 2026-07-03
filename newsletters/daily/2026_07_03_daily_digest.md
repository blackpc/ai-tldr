<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Cloudflare — separate AI crawler controls for Search, Agent, and Training bots -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cf-assets.www.cloudflare.com/zkvhlag99gkb/6WfuWZFkYwf6QwyYidzYdo/621c1bd35911a6aa5aaa0d6a3758da18/BLOG-3337_OG.png" alt="Cloudflare AI Traffic Controls dashboard splitting Search, Agent, and Training bots" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Cloudflare — separate AI crawler controls for Search, Agent, and Training bots</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Cloudflare replaces its single 'Block AI Bots' toggle with three per-purpose switches — Search, Agent, and Training.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Cloudflare's new AI Traffic Controls give site owners three independent switches for Search, Agent, and Training bots on every zone. The previous option was a blanket 'Block AI Bots' toggle that treated a Google search crawler and an OpenAI training scrape the same way.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Each crawler declares its purpose via a Forwarded header (RFC 7239) with a <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">use=</code> parameter — reference for cited retrieval, immediate for agent actions, or Training for data collection. Cloudflare's managed robots.txt now emits <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">use=reference</code> by default.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Publishers can now keep their content in Google Search while blocking OpenAI, Anthropic, and Google from training on it. New defaults land September 15 — ad-monetized pages will block Training and Agent bots automatically unless an owner opts out.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Publishers, AI labs running crawlers, and platform engineers who operate bots — available free to all Cloudflare customers immediately.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Cloudflare</td>
<td align="right"><a href="https://blog.cloudflare.com/content-independence-day-ai-options/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Google Interactions API GA -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Interactions_API_GA_final.width-1300.png" alt="Google Interactions API general availability announcement graphic" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Gemini Interactions API GA — Google's unified endpoint for models and agents</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">One endpoint for Gemini model calls and agent runs, now stable and the default across Google's AI stack.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
The Interactions API is Google's new primary interface for building on Gemini, replacing <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">generateContent</code> as the default across AI Studio, docs, and partner integrations. A single endpoint accepts either a model ID for inference or an agent ID for Deep Research and other managed agents.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Each call creates an Interaction resource stored server-side, so a follow-up turn only needs <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">previous_interaction_id</code> instead of the full chat history. Data is retained 55 days on paid plans, 1 day on free, and callers can opt out with <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">store=false</code>.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
New Gemini models, tools, and agent features will land on the Interactions API first — <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">generateContent</code> stays supported but won't be where frontier capabilities ship. Cached server-side state also means fewer input tokens per multi-turn call.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Gemini API developers, agent builders, and anyone using Deep Research programmatically — Python and JavaScript SDKs available at <a href="https://ai.google.dev/gemini-api/docs/interactions" style="color: #f7ff00; text-decoration: none;">ai.google.dev</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Google</td>
<td align="right"><a href="https://blog.google/innovation-and-ai/technology/developers-tools/interactions-api-general-availability/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Claude Code 2.1.198 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/4ce6e0001501913511969f8ea1b0fe2618ee4a3b21c917fc9cdcc769e7603d98/anthropics/claude-code/releases/tag/v2.1.198" alt="Claude Code v2.1.198 GitHub release page header" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Claude Code 2.1.198 — subagents run in the background by default</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Claude Code's subagents now run in the background by default and Claude in Chrome reaches general availability.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Subagents in <a href="https://github.com/anthropics/claude-code/releases/tag/v2.1.198" style="color: #f7ff00; text-decoration: none;">Claude Code 2.1.198</a> flip from foreground to background by default: the main conversation keeps running while a subagent works, and Claude is notified when it finishes. The release also moves Claude in Chrome from beta to GA and adds a <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">/dataviz</code> skill for chart and dashboard design.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Background agents launched from <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">claude agents</code> automatically commit, push, and open a draft PR when they finish worktree code work. The built-in Explore agent now inherits the main session's model (capped at Opus) instead of running on Haiku.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Foreground subagents used to stall the main chat while research ran; making them background-first turns Claude Code into a fan-out orchestrator without blocking the user. Auto-commit-and-draft-PR on background agents makes hands-off ticket work practical.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Claude Code power users and agentic-coding teams running long-lived subagents. Update with <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">claude update</code> or <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">npm i -g @anthropic-ai/claude-code</code>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Anthropic</td>
<td align="right"><a href="https://github.com/anthropics/claude-code/releases/tag/v2.1.198" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Kimi K2.7-Code in GitHub Copilot -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://github.blog/wp-content/uploads/2026/06/613814616-4d64d5a2-d26c-4377-9ce6-a444b1b30840.png" alt="GitHub Copilot model picker showing Kimi K2.7 Code selected" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Kimi K2.7-Code in GitHub Copilot — first open-weight model in the picker</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">GitHub Copilot's model picker now ships Kimi K2.7-Code — the first open-weight option, hosted on Azure.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://huggingface.co/moonshotai/Kimi-K2.7-Code" style="color: #f7ff00; text-decoration: none;">Kimi K2.7-Code</a> is Moonshot AI's trillion-parameter open-weight coding model, now selectable inside <a href="https://github.blog/changelog/2026-07-01-kimi-k2-7-is-now-available-in-github-copilot/" style="color: #f7ff00; text-decoration: none;">GitHub Copilot</a>. The Copilot picker previously listed only proprietary APIs — this is the first model with published weights sitting alongside them.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
GitHub hosts Kimi K2.7-Code on Microsoft Azure and bills it at Moonshot's provider list pricing under Copilot's usage-based billing. The model handles chat, edits, and agent turns everywhere Copilot ships — VS Code, JetBrains, Xcode, Eclipse, the CLI, and GitHub Mobile.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
A team on Copilot Pro can now A/B test Kimi against Claude or GPT on real tickets without leaving the editor. And because the weights are public, a team that likes the results can self-host the same model for offline or regulated work — something no earlier Copilot pick allowed.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
GitHub Copilot Pro, Pro+, and Max users today; Business and Enterprise follow in coming weeks (off by default — admins must enable).
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">GitHub</td>
<td align="right"><a href="https://github.blog/changelog/2026-07-01-kimi-k2-7-is-now-available-in-github-copilot/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: xAI Voice Agent Builder -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://x.ai/images/news/grok-voice-agent-builder.webp" alt="xAI Voice Agent Builder — announcement hero for the no-code voice agent platform" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">xAI Voice Agent Builder — no-code builder for production voice agents</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">xAI's Voice Agent Builder is a no-code way to ship production voice agents on Grok Voice, priced by the minute.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://x.ai/news/grok-voice-agent-builder" style="color: #f7ff00; text-decoration: none;">Voice Agent Builder</a> is xAI's no-code console for wiring up production voice agents on top of the Grok Voice model. Developers pick a voice, add tools and a knowledge base, hook up telephony, and have a running agent in about two minutes — no glue code between STT, LLM, and TTS.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The builder wraps xAI's <code style="font-family: Menlo, Consolas, monospace; background-color: #181818; padding: 1px 4px;">grok-voice-latest</code> speech-to-speech model in a WebSocket runtime with sub-second turn-taking. SIP support lets an agent answer an existing phone number; MCP servers, custom HTTP tools, and a knowledge-base layer are built in.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
The flat $0.05/min agent-audio rate (plus $0.01/min for provisioned telephony numbers) undercuts the typical vendor stack that bills STT, LLM, and TTS separately. Real voice-agent deployment — support, sales, scheduling — opens up to teams that couldn't budget legacy speech stacks.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Product teams shipping voice agents for support, sales, or telephony workflows. Public beta, available at <a href="https://docs.x.ai/docs/guides/voice" style="color: #f7ff00; text-decoration: none;">docs.x.ai</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">xAI</td>
<td align="right"><a href="https://x.ai/news/grok-voice-agent-builder" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Anthropic CJS Jailbreak Framework -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://www.anthropic.com/api/opengraph-illustration?name=Hand%20Lock&backgroundColor=cactus" alt="Anthropic Fable 5 cyber safeguards and jailbreak framework announcement graphic" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-02</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Anthropic CJS — a 0-to-4 severity scale for AI cyber jailbreaks</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A draft severity scale for AI cyber jailbreaks, paired with a bounty program, so researchers can grade and report attacks against Claude.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Anthropic's <a href="https://www.anthropic.com/news/fable-safeguards-jailbreak-framework" style="color: #f7ff00; text-decoration: none;">Cyber Jailbreak Severity (CJS) framework</a> is a proposed 0-to-4 rating system for AI jailbreaks, developed with Project Glasswing partners. It fills a real gap: the industry has no agreed language for saying how bad a given jailbreak actually is.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
CJS combines four dimensions — capability gain, breadth, ease of weaponization, and discoverability — into a single 0–10 score bucketed from CJS-0 (informational) to CJS-4 (critical). The bands are exponential. Researchers can now report jailbreaks against Claude Fable 5 through a new <a href="https://hackerone.com/anthropic" style="color: #f7ff00; text-decoration: none;">HackerOne</a> program.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
CJS gives the AI safety community a common vocabulary for jailbreaks, the way CVSS did for software vulnerabilities. If frontier labs adopt it, jailbreak disclosures can be triaged and prioritized against a shared scale instead of every vendor eyeballing severity.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI safety researchers, red-teamers, and security engineers at frontier labs — feedback open at <a href="mailto:cyber-safeguards@anthropic.com" style="color: #f7ff00; text-decoration: none;">cyber-safeguards@anthropic.com</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Anthropic</td>
<td align="right"><a href="https://www.anthropic.com/news/fable-safeguards-jailbreak-framework" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: ZCode — Z.ai's coding harness for GLM-5.2 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://zcode.z.ai/images/summary_large_image.png" alt="ZCode marketing hero image showing the GLM-5.2 desktop coding harness" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">ZCode — Z.ai's official coding harness for GLM-5.2</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">GLM-5.2 gets an official desktop harness that plans, codes, and takes orders from your phone.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://zcode.z.ai/en" style="color: #f7ff00; text-decoration: none;">ZCode</a> is Z.ai's own desktop coding agent for its open-weight <a href="https://huggingface.co/zai-org/GLM-5.2" style="color: #f7ff00; text-decoration: none;">GLM-5.2</a> model. The app packages GLM-5.2 with a multi-agent system, a terminal, and "Goals" — long-horizon tasks that keep planning, executing, and verifying while the developer is away.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Multiple agents inside ZCode share the same repo and tools: one drafts a plan, another writes code, a third reviews and runs tests. Goals track each long task's state so a user can start it on desktop and steer it from WeChat, Feishu, or Telegram while away.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Every serious coding model now has a first-party harness: Claude has Claude Code, Codex has Codex Remote, and GLM-5.2 has ZCode. Teams betting on an open-weight coding model no longer have to graft it into a third-party wrapper to get the polished agent experience.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers who already use GLM-5.2 and want an official desktop workflow. Lite starts at $16.20/mo; native installers for macOS, Windows, and Linux.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Z.ai</td>
<td align="right"><a href="https://zcode.z.ai/en" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="padding-top: 32px; border-top: 2px solid #f5f5f0; text-align: center;">
<p style="margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #f5f5f0;">All releases at <a href="https://ai-tldr.dev" style="color: #f7ff00; text-decoration: none;">ai-tldr.dev</a></p>
<p style="margin: 0; font-size: 14px; color: #8a8a85;">Simple explanations • No jargon • Updated daily</p>
</td>
</tr>

</table>
</td>
</tr>
</table>

<!-- Open-tracking pixel (pomegra analytics). Must be the last element in the body. -->
<img src="https://analytics.pomegra.io/p/iVFoPRUpT" width="1" height="1" alt="" style="display:none" border="0">
