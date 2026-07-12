<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Grok Build CLI ships whole repos and .env secrets to xAI -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<!-- Image row -->
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
Cereblab's wire-level packet capture of <a href="https://x.ai/news/grok-build-cli" style="color: #f7ff00;">Grok Build CLI</a> 0.2.93 shows the tool posting file contents — including .env files with API keys and passwords — to two channels: a live model endpoint and a session-state archive that routes to a Google Cloud bucket called grok-code-session-traces.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Beyond the files the agent reads, Grok Build CLI packages the entire repository as a git bundle and streams it up in ~75 MB chunks — in one 12 GB test repo, the storage channel uploaded 5.10 GiB across 73 chunks while the model-turn channel moved only 192 KB, a ~27,800× disparity.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Toggling "Improve the model" off did not disable the upload — the server kept returning trace_upload_enabled: true — so the standard opt-out path is ineffective, and xAI has not published a Data Processing Agreement covering the bucket.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Any developer or org using Grok Build CLI on private repos — stop and read this first.
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

<!-- Image row -->
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
<a href="https://github.com/Mesh-LLM/mesh-llm" style="color: #f7ff00;">Mesh LLM</a> is an Apache-2.0 Rust binary that turns whatever mix of GPU and CPU boxes you already own into one shared inference cluster, exposing an OpenAI-compatible API at localhost:9337/v1. The install is about 18 MB and supports 40+ models from 500M to 235B parameters.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Every request routes through local GPU, peer forwarding to another mesh node, or "Skippy" split mode — which partitions a model too big for one box by layer ranges across several machines. <a href="https://github.com/n0-computer/iroh" style="color: #f7ff00;">iroh</a> handles QUIC transport, NAT traversal, and authenticated peer identity underneath.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
For teams that already own idle GPUs, Mesh LLM replaces the pay-per-token bill with a p2p pool that speaks the same OpenAI SDK — and Skippy makes a 4-machine setup a viable alternative to a rented H100.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Self-hosters, small labs, and startups with unused GPU capacity.
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

<!-- Image row -->
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
<a href="https://openclaw.ai" style="color: #f7ff00;">OpenClaw</a> 2026.7.1-beta.5 introduces Crestodian — an agent-loop onboarding flow that walks new users through provider setup on the CLI, web installer, and macOS app with masked credential prompts. The same build adds the bundled ClawRouter provider, offline mobile chat, and OpenAI's GPT-5.6 Sol, Terra, and Luna models across the stack.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Crestodian runs a real OpenClaw agent loop to gather keys, pick a default model, and verify the pipeline before writing config. ClawRouter then handles per-request routing with credential-scoped dynamic model discovery, and a new <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">openclaw attach</code> command hands an existing Gateway session to Claude Code with scoped, revocable MCP grants.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
First-time setup was the biggest wall for OpenClaw's 382k-star audience — beta.5 replaces long config files with a chat that installs itself, and ClawRouter makes it practical to run one OpenClaw install as the hub for Claude Code, Codex, and multiple provider accounts side by side.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Self-hosters, coding-agent power users, and teams standardizing on one Gateway.
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

<!-- CARD: Claude Code Week 28 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<!-- Image row -->
<tr>
<td>
<img src="https://opengraph.githubassets.com/44d9d2af4eab696d3ce1b966e6d27e5140989c6e476785f163b3a933d1ff5889/anthropics/claude-code" alt="Claude Code GitHub repository social card with the Anthropic wordmark and Claude Code title" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Claude Code Desktop — in-app browser lands and /doctor gains a repair mode</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Claude Code Week 28 gives the desktop app a real browser and turns /doctor from a report into a fixer.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://github.com/anthropics/claude-code" style="color: #f7ff00;">Claude Code</a> v2.1.202–v2.1.206 ships two headline features: a built-in sandboxed browser in the desktop app so Claude can open external sites and interact with them, and a rebuilt <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">/doctor</code> command that can actually fix what it finds.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The in-app browser is a sandboxed webview with a safety classifier that reviews every action before Claude takes it on an external page. The rebuilt <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">/doctor</code> (alias <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">/checkup</code>) checks install health, unused skills, slow hooks, and duplicate CLAUDE.md content — then confirms before applying each fix.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
The browser removes a common workaround where developers had to paste external docs into the terminal by hand. The auto mode rule blocking transcript-file tampering also closes a known way agentic mode could rewrite its own audit trail.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Claude Code Desktop users on macOS, Windows, and Linux.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Anthropic</td>
<td align="right"><a href="https://code.claude.com/docs/en/whats-new/2026-w28" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Cursor 3.11 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<!-- Image row -->
<tr>
<td>
<img src="https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/opengraph-changelog-july-10-2026.png" alt="Cursor 3.11 changelog banner introducing side chats and conversation search" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Cursor 3.11 — side chats and conversation search land in the coding editor</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Cursor 3.11 spins up parallel Side Chats and makes every past agent transcript searchable.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://cursor.com" style="color: #f7ff00;">Cursor</a> 3.11 adds Side Chats — full agent conversations that run alongside your main thread via <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">/side</code>, <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">/btw</code>, or a plus button — plus a local index that makes Cmd+K search across thousands of past agent transcripts.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Side chats are durable and @-mentionable, so you can pull their conclusions back into the main thread without copy-pasting. Five new cloud agent hooks — beforeSubmitPrompt, afterAgentResponse, afterAgentThought, stop, subagentStart — let scripts observe and steer long-running agents.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
The main gripe with agentic IDEs was context loss: a side question derailed the multi-file refactor already in flight. Side Chats split tangents into their own durable thread, and weeks of prior work are now instantly searchable.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Coding-agent power users and teams running long-horizon agentic tasks in <a href="https://cursor.com" style="color: #f7ff00;">Cursor</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Cursor</td>
<td align="right"><a href="https://cursor.com/changelog/side-chat" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: LiteRT.js -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<!-- Image row -->
<tr>
<td>
<img src="https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Gemini_Generated_Image_9xjum29xju.2e16d0ba.fill-1200x600.jpg" alt="LiteRT.js blog banner announcing Google's Web AI runtime" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-09</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">LiteRT.js — Google brings its on-device AI runtime to the browser</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">LiteRT.js runs Google's on-device inference stack inside the browser, so web apps can execute .tflite models with WebGPU and WebNN acceleration.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://developers.googleblog.com/en/litertjs-googles-high-performance-web-ai-inference/" style="color: #f7ff00;">LiteRT.js</a> is a new JavaScript library from Google (npm: <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">@litertjs/core</code>) that runs .tflite machine-learning models inside a web page with no server call, and works with PyTorch, JAX, and TensorFlow after conversion.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The library compiles Google's native LiteRT C++ runtime to WebAssembly and swaps in three backends: XNNPACK for CPU, ML Drift over WebGPU for GPU, and the experimental WebNN API for NPUs. A companion <code style="font-family: Menlo, Consolas, monospace; color: #f7ff00;">@litertjs/tfjs-interop</code> package lets existing TensorFlow.js apps adopt it incrementally.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Google's M4 MacBook Pro benchmarks show up to 3x speedups over prior web runtimes on CPU and 5–60x moving from CPU to GPU or NPU — making on-device voice, translation, and image editing viable in a normal web app without a server bill.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Web and browser developers who want on-device AI inference without a backend (Apache-2.0, free to use commercially).
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Google</td>
<td align="right"><a href="https://developers.googleblog.com/en/litertjs-googles-high-performance-web-ai-inference/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: George Hotz AI 2040 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<!-- Image row -->
<tr>
<td>
<img src="https://geohot.github.io/blog/assets/images/ocean_datacenter.jpg" alt="Illustration of an ocean-based data center from George Hotz's AI 2040 essay" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
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

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">AI 2040 and the Cult of Intelligence — Hotz argues fast takeoff ignores physics</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">George Hotz answers the AI 2040 Plan A scenario — arguing that physics, not policy, is what bounds how fast AI can transform the world.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
A July 11 blog post by <a href="https://geohot.github.io/blog/" style="color: #f7ff00;">George Hotz</a> (tinygrad, ex-Comma.ai) responding to <a href="https://ai-2040.com/" style="color: #f7ff00;">Daniel Kokotajlo's AI 2040 Plan A</a>, calling the hard-takeoff picture a "cult of intelligence" — the belief that a smart-enough model can rewrite physical reality.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The essay uses concrete constraints to bound AI's speed of impact: chip fabs run on 3-month physical cycles, ocean data centers still ship components on 3-week boat rides, and "no matter how high quality your tokens are, they cannot turn lead into gold."
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Hotz is one of the few well-known engineers publicly rejecting the hard-takeoff frame from the inside — the post hit the HN front page at 163 points and 187 comments within hours, giving safety and open-source-AI advocates a shared reference.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI safety researchers, open-source-AI advocates, and anyone weighing centralized vs. local model deployment.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">George Hotz</td>
<td align="right"><a href="https://geohot.github.io/blog/jekyll/update/2026/07/11/ai-2040.html" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
