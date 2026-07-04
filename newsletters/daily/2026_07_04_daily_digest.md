<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Alibaba bans Claude Code -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://storage.googleapis.com/media.mwcradio.com/mimesis/2026-07/03/2026-07-03T065029Z_1_LYNXMPEM620CS_RTROPTP_3_CHINA-TRADE-EXPO.JPG" alt="Alibaba booth at a China trade expo, illustrating the Reuters report on the Claude Code ban" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-03</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Alibaba bans Claude Code — cites Chinese-timezone fingerprinting</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Alibaba tells staff to drop Claude Code on July 10 after finding it checked for Chinese timezones; Anthropic pulled the code July 1.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Alibaba has ordered employees to stop using Anthropic's <a href="https://claude.ai/code" style="color: #f7ff00;">Claude Code</a> from July 10, after engineers found the tool had been checking whether the machine's timezone was Asia/Shanghai or Asia/Urumqi and probing proxies against a list of Chinese cloud, tech, and AI-lab hostnames since April 2.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The code ran client-side inside Claude Code and, if it matched a timezone or hostname pattern, marked the request so Anthropic servers could react. Anthropic called it an anti-abuse experiment to detect unauthorized resellers and distillation traffic, and removed it on July 1 after roughly three months in production.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Claude Code runs with full read/write access to a developer's repo, so silent client-side telemetry is a real supply-chain risk — this incident becomes exhibit A for enterprise vetting of coding agents. It also escalates the ongoing spat where Anthropic told US senators that Qwen operators used ~25,000 fake accounts to distill Claude.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Chinese engineering teams (forced migration to Qwen-Code before July 10) and every enterprise vetting coding agents for outbound telemetry.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Alibaba</td>
<td align="right"><a href="https://wtaq.com/2026/07/03/alibaba-to-ban-claude-code-in-workplace-over-alleged-backdoor-risks-source-says/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Cloudflare AI Traffic Controls -->
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

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Cloudflare replaces its single "Block AI Bots" toggle with three per-purpose switches — Search, Agent, and Training.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://blog.cloudflare.com/content-independence-day-ai-options/" style="color: #f7ff00;">Cloudflare's new AI Traffic Controls</a> give every site owner three independent switches for Search, Agent, and Training bots — replacing the old blanket "Block AI Bots" toggle that treated a search crawler and a training scrape identically. All tiers, including free, get the controls immediately.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Each crawler is expected to declare its purpose in a Forwarded header (RFC 7239) with a <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">use=</code> parameter — <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">use=reference</code> for cited retrieval, <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">use=immediate</code> for real-time agent action. New defaults blocking Training and Agent bots on ad-supported pages take effect September 15.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Publishers can now keep their SEO traffic flowing to Google Search while blocking OpenAI, Anthropic, and Google from training on their content — a split that wasn't possible with a single toggle. AI labs must tag crawlers by purpose or risk being blocked as unlabeled traffic after September 15.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Publishers, AI labs running crawlers, and platform engineers who operate bots at scale.
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
The <a href="https://blog.google/innovation-and-ai/technology/developers-tools/interactions-api-general-availability/" style="color: #f7ff00;">Interactions API</a> is Google's new primary interface for Gemini, replacing <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">generateContent</code> as the default across AI Studio, docs, and partner integrations. A single endpoint handles both model inference (by model ID) and managed agents like Deep Research (by agent ID).
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Each call creates an Interaction resource stored server-side, so follow-up turns only need <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">previous_interaction_id</code> instead of resending the full chat history. Managed Agents run in remote Linux sandboxes with background execution and observable step traces; state is retained 55 days on paid, 1 day on free.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
New Gemini frontier models, tools, and agent features will ship here first — teams on <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">generateContent</code> won't get them by default. Multi-turn calls also get cheaper because server-side state means fewer input tokens per turn.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Gemini API developers, agent builders, and anyone using Deep Research programmatically.
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

<!-- CARD: Apple Safari MCP Server -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://webkit.org/wp-content/themes/webkit/images/preview-card.jpg" alt="WebKit blog preview card announcing the Safari MCP server" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
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

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Safari MCP server — Apple lets AI agents drive Safari to debug websites</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Apple gives coding agents a direct line into Safari — 17 MCP tools for the DOM, network, console, screenshots and clicks.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://webkit.org/blog/18136/introducing-the-safari-mcp-server-for-web-developers/" style="color: #f7ff00;">Safari MCP</a> is an MCP server bundled with Safari Technology Preview 247 that lets AI coding agents connect to a live Safari window. The server exposes 17 tools — screenshots, DOM reads, JavaScript evaluation, network inspection, page navigation, and typing/clicking — through the Model Context Protocol.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The server runs locally on top of <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">safaridriver</code>; an MCP client like Claude Code or Codex spawns it with the <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">--mcp</code> flag. All page data goes straight to the agent — no data leaves to Apple.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Coding agents can now test against the real Safari WebKit engine — not Chromium — so agents can catch compatibility bugs and layout regressions on Apple's stack without a human clicking around.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Web developers using Claude Code, Codex, or other MCP-aware coding agents on macOS.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Apple WebKit</td>
<td align="right"><a href="https://webkit.org/blog/18136/introducing-the-safari-mcp-server-for-web-developers/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Current AI Open Source Gap Map -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://map.currentai.org/current-ai-og.png" alt="Open Source AI Gap Map poster showing scored layers of the AI stack" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">RESOURCE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-02</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Open Source AI Gap Map — Current AI charts 421 open-source AI products in one place</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A living, MIT-licensed atlas of the open-source AI stack with 421 scored products across 9 layers.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
The <a href="https://map.currentai.org" style="color: #f7ff00;">Open Source AI Gap Map</a> is a public catalog of every meaningful open-source project across the AI stack — from base models and inference code to agent frameworks and hardware. Version 0.1 covers 421 products from 228 organizations, and unlike an awesome-list, scores each on openness, capability, and adoption so gaps stand out.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Each entry lives as a YAML file in a <a href="https://github.com/currentai-org/os-ai-map" style="color: #f7ff00;">public GitHub repo</a> (MIT-licensed) with three independent scores plus links to primary sources. Current AI groups the 421 products into 9 stack layers, making thin layers — like training or synthetic datasets — immediately visible as holes.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
It turns "is there a real open alternative to X?" from vibes into a scored comparison across 421 projects. It's also the first artifact from Current AI, a $400M non-profit whose goal is a vendor-independent open-source AI stack.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
OSS AI maintainers, funders, policy teams, and researchers picking dependencies.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Current AI</td>
<td align="right"><a href="https://map.currentai.org" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: ByteDance EdgeBench -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cdn-thumbnails.huggingface.co/social-thumbnails/datasets/ByteDance-Seed/EdgeBench.png" alt="EdgeBench dataset card on Hugging Face showing the ByteDance Seed benchmark" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">BENCHMARK</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-02</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">EdgeBench — ByteDance's 134-task long-horizon agent benchmark</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">ByteDance Seed's new agent benchmark clocks 12+ hours per task to measure how fast models learn on the job.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://edge-bench.org/" style="color: #f7ff00;">EdgeBench</a> is a benchmark of 134 real-world tasks spanning scientific ML, systems engineering, combinatorial optimization, professional knowledge work, formal theorem proving, and interactive games. ByteDance Seed released 51 tasks publicly on <a href="https://huggingface.co/datasets/ByteDance-Seed/EdgeBench" style="color: #f7ff00;">Hugging Face</a> and <a href="https://github.com/ByteDance-Seed/EdgeBench" style="color: #f7ff00;">GitHub</a> on July 2.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Each task runs 12 or more hours of continuous agent operation inside an executable environment (some extend past 72 hours), scoring the full learning trajectory rather than a single answer using a log-sigmoid curve. Human experts average 57.2 hours per task.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Most benchmarks reward one-shot correctness; EdgeBench measures how fast agents learn from real environments over time. Its headline finding: AI agents' learning speed roughly doubles every three months from September 2025 to May 2026 — a concrete scaling curve for agents, not just pretraining.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Agent researchers, evaluation teams, and RL and agentic-tools builders.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">ByteDance Seed</td>
<td align="right"><a href="https://edge-bench.org/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
<a href="https://www.anthropic.com/news/fable-safeguards-jailbreak-framework" style="color: #f7ff00;">Anthropic's Cyber Jailbreak Severity (CJS) framework</a> is a proposed rating system that scores an AI jailbreak on a 0-to-4 scale (CJS-0 informational through CJS-4 critical), developed with Project Glasswing partners. It fills a real gap: the industry has no agreed language for saying how bad a given jailbreak actually is.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
CJS combines four dimensions — capability gain, breadth, ease of weaponization, and discoverability — into a 0–10 score bucketed into five levels. The bands are exponential, so each level represents a much larger risk than the last. Researchers can now report jailbreaks against Claude Fable 5 through a new HackerOne program.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
CJS gives the AI safety community a common vocabulary for jailbreaks — the way CVSS did for software vulnerabilities. If frontier labs adopt it, disclosures can be triaged, priced, and prioritized against a shared scale instead of each vendor eyeballing severity independently.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI safety researchers, red-teamers, and security engineers at frontier labs.
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
