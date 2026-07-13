<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Grok Build CLI ships whole repos and .env secrets to xAI -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://github.githubassets.com/assets/gist-og-image-54fd7dc0713e.png" alt="GitHub gist header — wire-level teardown of xAI Grok Build CLI 0.2.93" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Grok Build CLI ships whole repos and .env secrets to xAI — wire-level teardown</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A wire trace of Grok Build CLI shows secrets and full repos leaving your machine even after you opt out.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://gist.github.com/cereblab/dc9a40bc26120f4540e4e09b75ffb547" style="color: #f5f5f0; text-decoration: none;">Grok Build CLI</a> is xAI's official coding agent. A wire-level packet capture of version 0.2.93 shows the tool posting file contents — including .env files with API keys — to xAI servers and a Google Cloud bucket, even while processing secrets.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Beyond the files the agent reads, Grok Build packages the entire repository as a git bundle and streams it in ~75 MB chunks to a storage bucket named grok-code-session-traces. In one 12 GB test repo, the storage channel uploaded 5.10 GiB while the model-turn channel moved only 192 KB — a ~27,800× disparity.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Any team running Grok Build CLI on private repos has been shipping full history and secrets to xAI infrastructure without a way to stop it. Toggling "Improve the model" off had no effect — the server kept returning trace_upload_enabled: true.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Any developer or org using Grok Build CLI on private repos — check your current setup before your next session.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">cereblab</td>
<td align="right"><a href="https://gist.github.com/cereblab/dc9a40bc26120f4540e4e09b75ffb547" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Mesh LLM -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/54529d7ceb82fd0389735d54a07a9b1c21f7411ae58bd26e77e4d00fe6be100e/Mesh-LLM/mesh-llm" alt="Mesh LLM GitHub repo social card — distributed AI/LLM for the people" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-11</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Mesh LLM — distributed inference on iroh's peer-to-peer network</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Pool GPUs across your machines and serve any of 40+ models through one OpenAI-compatible endpoint at localhost:9337.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://github.com/Mesh-LLM/mesh-llm" style="color: #f5f5f0; text-decoration: none;">Mesh LLM</a> is an Apache-2.0 Rust binary that turns whatever GPU and CPU boxes you already own into a shared inference cluster, exposing an OpenAI-compatible API at localhost:9337. It launched July 11 with a catalog of 40+ models from 500M to 235B parameters.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Requests flow through one of three paths: local GPU mode, peer routing to another mesh node that already has the model loaded, or "Skippy" split mode that partitions a model by layer ranges across machines — with iroh QUIC transport and NAT traversal underneath, no public IP required.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
For teams with idle GPUs, Mesh LLM replaces the pay-per-token bill with a p2p pool that speaks the same OpenAI SDK. Skippy makes a 4-machine setup a practical alternative to a rented H100 for the 235B MoE models that won't fit on a single consumer card.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Self-hosters, small labs, and startups with unused GPU capacity looking to cut inference spend.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Mesh LLM</td>
<td align="right"><a href="https://www.iroh.computer/blog/mesh-llm" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: OpenClaw 2026.7.1-beta.5 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/72c697076858d31b9438a149667ec32192a7897e73f7293e07c991675d3e2da2/openclaw/openclaw/releases/tag/v2026.7.1-beta.5" alt="OpenClaw v2026.7.1-beta.5 release header on GitHub" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-11</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">OpenClaw 2026.7.1-beta.5 — conversational setup and GPT-5.6 support land</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">OpenClaw's beta.5 turns first-run setup into a live agent conversation and wires GPT-5.6 into the whole stack.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://github.com/openclaw/openclaw" style="color: #f5f5f0; text-decoration: none;">OpenClaw</a> 2026.7.1-beta.5 introduces Crestodian, an agent-loop onboarding wizard that walks new users through provider setup on the CLI, web installer, and macOS app with masked credential prompts. The same build adds ClawRouter, offline mobile chat, and OpenAI's GPT-5.6 Sol, Terra, and Luna models.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Crestodian runs a real OpenClaw agent loop to gather API keys, pick a default model, and verify the pipeline before writing config. ClawRouter then handles per-request routing with credential-scoped dynamic model discovery across OpenAI-compatible, native Anthropic, and Gemini transports.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
First-time setup was the biggest wall for OpenClaw's 382k-star audience — beta.5 replaces long config files with a chat that installs itself. A new <code style="font-family: Menlo, Consolas, monospace; font-size: 13px;">openclaw attach</code> command also lets one install act as the hub for Claude Code, Codex, and multiple provider accounts side by side.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Self-hosters, coding-agent power users, and teams standardizing on one Gateway for multiple AI providers.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenClaw</td>
<td align="right"><a href="https://github.com/openclaw/openclaw/releases/tag/v2026.7.1-beta.5" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Simon Willison — LLM agent should never be the DRI -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://github.com/simonw.png" alt="Simon Willison avatar" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-12</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Simon Willison — an LLM agent should never be the DRI for a project</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">The 1979 IBM slide is back: a computer can never be held accountable, so it must never be your DRI.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://simonwillison.net/" style="color: #f5f5f0; text-decoration: none;">Simon Willison</a> argues that the Directly Responsible Individual — Apple's name for the one person accountable for a project — must always be human. An LLM agent can draft, build, and write, but accountability is a human property and agents can only assist whoever carries it.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The argument anchors on a 1979 IBM training slide: "A computer can never be held accountable, therefore a computer must never make a management decision." A DRI takes the blame when a project ships broken; there is no one to fire when an agent hallucinates a deadline.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
As agent-run projects become normal, the DRI line keeps humans named on every decision with real-world consequences — protecting the org (outages, ethics, security) and the individual (agents cannot dodge accountability by pointing at their model).
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Engineering managers, agent builders, and tech leads staffing AI-augmented teams.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Simon Willison</td>
<td align="right"><a href="https://simonwillison.net/2026/Jul/12/directly-responsible-individuals/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Systima — Claude Code sends 33k tokens before your prompt -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://systima.ai/images/claude-code-vs-opencode-banner.png" alt="Systima blog banner comparing Claude Code and OpenCode token overhead" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-12</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Systima — Claude Code sends 33k tokens before your prompt, OpenCode sends 7k</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Systima's teardown finds Claude Code eats a 4.7x token surcharge before the user prompt even arrives, and its cache breaks mid-session.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://systima.ai/" style="color: #f5f5f0; text-decoration: none;">Systima</a> ran <a href="https://claude.ai/code" style="color: #f5f5f0; text-decoration: none;">Claude Code</a> and <a href="https://opencode.ai/" style="color: #f5f5f0; text-decoration: none;">OpenCode</a> against identical tasks and measured token spend on Sonnet 4.5. Claude Code injected roughly 33k tokens of scaffolding before the user prompt arrived; OpenCode used around 7k for the same job.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The team asked each harness for a one-line reply and counted tokens before and after adding production config. Claude Code also rewrote its prompt prefix mid-session, breaking the KV cache and producing up to 54x more cache-write tokens than OpenCode — billed at premium rates.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
A 4.7x token overhead is a real bill difference, not a benchmark curiosity. Once production settings are added — instruction files, MCP servers, two subagents — consumption jumps from 121k to 513k tokens, making the choice between Claude Code and OpenCode a monthly-invoice question.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Engineering leads picking between Claude Code and OpenCode for production coding-agent work at scale.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Systima</td>
<td align="right"><a href="https://systima.ai/blog/claude-code-vs-opencode-token-overhead" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Terry Tao ships math apps built with coding agents -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://terrytao.wordpress.com/wp-content/uploads/2026/07/image-2.png" alt="Screenshot from Terry Tao's July 11 2026 blog post on porting math applets with AI coding agents." width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-11</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Terry Tao ships math apps built with coding agents — 24 applets ported, 2 new tools</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Terry Tao writes up his own experience letting AI coding agents rebuild decades-old math applets — and finds one bug across 24 ports.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Fields Medalist <a href="https://terrytao.wordpress.com/" style="color: #f5f5f0; text-decoration: none;">Terry Tao</a> published a hands-on writeup of using an LLM coding agent to port two dozen legacy Java math applets to JavaScript, and build two new interactive tools he had previously abandoned — a Minkowski-space diagram editor and a Gilbreath conjecture visualizer.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Tao treats the math applets as low-risk secondary visualizations and lets the agent drive with light supervision — vibe coding. He reports finding only one minor bug across 24 ports, and the agent flagged two bugs in his original Java code that he hadn't noticed.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Tao is a Fields Medalist and one of the most-read mathematicians online, so his verdict on coding agents lands with an audience that rarely reads AI blogs. The essay gives a concrete pattern: pick a low-risk visualization task, use an agent, ship.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Researchers, educators, and hobbyists weighing whether coding agents can revive their own old side projects.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Terry Tao</td>
<td align="right"><a href="https://terrytao.wordpress.com/2026/07/11/old-and-new-apps-via-modern-coding-agents/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: George Hotz — I Love LLMs, I Hate Hype -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://avatars.githubusercontent.com/u/72895?v=4" alt="Portrait of George Hotz, author of the 'I love LLMs, I hate hype' essay" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-12</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">I Love LLMs, I Hate Hype — Hotz says frontier labs won't capture AI value</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">George Hotz argues AI is the computer revolution continuing, not a singularity, and frontier labs cannot lock down what Moore's law is already delivering.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://geohot.github.io/blog/" style="color: #f5f5f0; text-decoration: none;">George Hotz</a> (tinygrad, tinycorp) publishes an essay saying he genuinely loves LLMs but rejects hype from both sides — arguing AI progress is mostly Moore's law continuing, and that frontier labs won't capture the value they claim.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Hotz compares coding assistants to compilers and find/replace — real productivity, but not "a new law of physics." He cites a Linus Torvalds quote pegging agents at ~10x productivity vs. ~1000x for compilers, and calls Moore's law, not any single lab, the actual driver of the last three years of AI gains.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
His central claim: frontier labs "won't capture" the value they create, making trillion-dollar valuations a bet against commodification. The essay hit Hacker News with 399 points and gives open-source advocates a rebuttal to both doom and singularity framings in the same week GPT-5.6 is dominating AI Twitter.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI engineers weighing open-weight vs. frontier-lab bets, and anyone tired of both doom and singularity hype.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">George Hotz</td>
<td align="right"><a href="https://geohot.github.io/blog/jekyll/update/2026/07/12/i-love-llms.html" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
