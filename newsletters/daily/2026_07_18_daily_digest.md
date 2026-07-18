<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Hugging Face — production infrastructure hit by autonomous AI-agent intrusion -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://huggingface.co/blog/assets/security-incident-july-2026/thumbnail.png" alt="Hugging Face July 2026 security incident disclosure thumbnail" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-16</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Hugging Face — production infrastructure hit by autonomous AI-agent intrusion</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">First disclosed autonomous AI-agent intrusion of a major AI platform — internal data touched, tokens compromised, users urged to rotate.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
On July 16, <a href="https://huggingface.co" style="color: #f7ff00;">Hugging Face</a> disclosed a security incident in which part of its production infrastructure was compromised. What sets this incident apart is that every step — from initial code execution to lateral movement across internal clusters — was driven by an autonomous AI-agent framework rather than a human operator.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The attacker's opening move was a malicious dataset that abused two code-execution paths in Hugging Face's dataset-processing pipeline. The agent framework then escalated to node-level access, harvested cloud credentials, and moved laterally into several internal clusters over a weekend — Hugging Face reconstructed the timeline from 17,000+ recorded attacker events.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
This is the industry-forecast "agentic attacker" turning up in the wild against one of the most important AI infrastructure providers. The attacker was bound by no usage policy, while Hugging Face was initially blocked by commercial safety filters — flipping the usual defender-versus-attacker cost curve.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Anyone with a <a href="https://huggingface.co" style="color: #f7ff00;">Hugging Face</a> account or CI that pushes to the Hub — rotate your access tokens now at <a href="https://huggingface.co/settings/tokens" style="color: #f7ff00;">huggingface.co/settings/tokens</a>. Also essential reading for security teams building threat models that assume autonomous LLM-driven attackers.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Hugging Face</td>
<td align="right"><a href="https://huggingface.co/blog/security-incident-july-2026" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: GPT-Red — OpenAI's AI red-teamer beats humans 84% to 13% on prompt injection -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://images.ctfassets.net/kftzwdyauwt9/3ACfFRKDhuNzU4isOGxHRv/26f7f9bded23de64ea183a9ec19904c5/SEO_Card.png?w=1600&h=900&fit=fill" alt="OpenAI GPT-Red announcement card — Unlocking Self-Improvement for Robustness" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ALGORITHM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-15</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">GPT-Red — OpenAI's AI red-teamer beats humans 84% to 13% on prompt injection</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">OpenAI's internal AI trains itself to break other AIs so OpenAI can patch the holes before shipping.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
GPT-Red is an <a href="https://openai.com" style="color: #f7ff00;">OpenAI</a> safety model that automatically probes other AIs for prompt-injection weaknesses. Rather than a static benchmark, GPT-Red sends a live prompt, reads the response, and keeps rewriting its attack until the target misbehaves — succeeding 84% of the time versus 13% for human red-teamers.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
A reinforcement-learning loop pits GPT-Red against defender models: GPT-Red earns reward when it makes the defender leak secrets or execute an injected instruction; the defender earns reward for finishing the real task. Both sides keep evolving, forcing GPT-Red to invent novel attacks rather than replay known tricks.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
OpenAI credits GPT-Red with making <a href="https://openai.com/chatgpt" style="color: #f7ff00;">GPT-5.6</a> roughly six times more robust to prompt injection than its best model four months earlier — fake chain-of-thought injections that succeeded over 95% of the time against GPT-5.1 now succeed under 10% against GPT-5.6 Sol.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI safety researchers, red teamers, and security engineers who deploy LLMs behind tools — GPT-Red is internal only, but its hardening results ship in every GPT-5.6 deployment.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenAI</td>
<td align="right"><a href="https://openai.com/index/unlocking-self-improvement-gpt-red/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Claude Code 2.1.212 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/1/anthropics/claude-code" alt="GitHub release page for anthropics/claude-code v2.1.212" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-17</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Claude Code 2.1.212 — /fork forks to a background session, agents get budgets</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Claude Code's latest release makes /fork a background-session brancher and gives long-running tool calls and subagents hard budgets.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Version 2.1.212 of <a href="https://github.com/anthropics/claude-code" style="color: #f7ff00;">Claude Code</a> is a workflow release built around branching and budgets. <code style="background: #181818; padding: 2px 5px;">/fork</code> now copies the current chat into a new background session so you can explore a variation while the main run keeps going — the old in-session helper it used to launch is renamed <code style="background: #181818; padding: 2px 5px;">/subtask</code>.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Session-level counters cap WebSearch tool calls and subagent spawns at 200 by default (both tunable via env vars), and <code style="background: #181818; padding: 2px 5px;">/clear</code> resets the subagent budget. MCP tool calls that pass a two-minute wall clock get pushed into the background automatically.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
The 2.1.212 changes address the two most common ways an agent hangs or burns tokens — a runaway search loop and a slow MCP tool that freezes the session. Combined with the branching <code style="background: #181818; padding: 2px 5px;">/fork</code>, long multi-thread agent runs are easier to keep on the rails.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers who run Claude Code as a long-lived agent with subagents, MCP servers, or heavy WebSearch use. Update with <code style="background: #181818; padding: 2px 5px;">npm i -g @anthropic-ai/claude-code</code>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Anthropic</td>
<td align="right"><a href="https://github.com/anthropics/claude-code/releases/tag/v2.1.212" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: NVIDIA Cosmos 3 Edge -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://iprsoftwaremedia.com/219/files/202607/ec180c85cf8840fb0edaf360eba98abd/6a580ccd3d63323228944ad6_NVIDIA%20Cosmos%20in%20Japan/NVIDIA%20Cosmos%20in%20Japan_0846fd59-e6d6-419e-91a3-f8cd075ab146-prv.jpg?v=0846fd59-e6d6-419e-91a3-f8cd075ab146" alt="NVIDIA Cosmos physical-AI announcement in Tokyo" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-15</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">NVIDIA Cosmos 3 Edge — 4B world model that runs physical AI on Jetson</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">NVIDIA's Cosmos family gets a small, on-device sibling built for real-time robotics.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Cosmos 3 Edge is a 4-billion-parameter world model that runs directly on robots, cameras, and vehicles instead of a data-center GPU. <a href="https://www.nvidia.com" style="color: #f7ff00;">NVIDIA</a> built it on the Nemotron backbone so it can perceive an environment, reason about it, and output the next policy step without a network round trip.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The model takes video and sensor input, updates its internal world model on-device, and produces action policies for the robot. NVIDIA says teams can fine-tune Cosmos 3 Edge to a specific robot, vehicle, or sensor setup in about a day, targeting Jetson T2000/T3000, RTX GPUs, and DGX systems.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Cutting the world model down to 4B parameters lets it live on-device with real-time latency, so robotics teams no longer need a cloud call to get the next action. A dozen Japanese manufacturers — FANUC, Honda R&D, Sony, Kawasaki — joined the Cosmos Coalition the same week.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Robotics and physical-AI teams building factory arms, delivery vehicles, or autonomous industrial systems. Available through <a href="https://developer.nvidia.com" style="color: #f7ff00;">NVIDIA developer channels</a>; new Jetson T2000/T3000 modules ship alongside.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">NVIDIA</td>
<td align="right"><a href="https://nvidianews.nvidia.com/news/japans-robotics-and-manufacturing-leaders-build-on-nvidia-cosmos-to-advance-physical-ai-frontier" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Suno hacked -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://storage.ghost.io/c/0f/76/0f76b548-bc58-4f25-abc3-3f5ebca07da4/content/images/size/w1200/2026/07/CleanShot-2026-07-15-at-06.52.15@2x.png" alt="Screenshot from Suno's leaked training-pipeline source code" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-15</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Suno hacked — leak exposes customer data and reveals YouTube and Deezer music scraping</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A supply-chain hack on Suno leaked customer data and, along with it, the sources it scraped to train.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://suno.com" style="color: #f7ff00;">Suno</a>, the AI music generator, was compromised in November 2025 via a supply-chain attack that stole an employee's credentials. The breach exposed source code plus emails, phone numbers, and partial credit card numbers for hundreds of thousands of customers — disclosed publicly on July 15 by <a href="https://www.404media.co" style="color: #f7ff00;">404 Media</a>.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The stolen source code documents Suno's ingestion pipeline in detail: 113,879 hours scraped from YouTube Music, 62,117 from Pond5, 17,615 from Genius, 12,287 from Deezer, 19,514 from IMSLP, plus material from Jamendo, Freesound, and 420,000 podcasts.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Users get direct evidence their personal data was exposed without notification. Record labels suing Suno now have specific numbers — and evidence of bypassing YouTube's anti-scraping protections — that could turn a fair-use debate into a DMCA claim.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Suno subscribers should review their account and watch for phishing. Security teams and lawyers tracking AI copyright cases will want the full <a href="https://www.404media.co/hack-reveals-suno-ai-music-generator-scraped-youtube-deezer-and-genius/" style="color: #f7ff00;">404 Media report</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Suno</td>
<td align="right"><a href="https://www.404media.co/hack-reveals-suno-ai-music-generator-scraped-youtube-deezer-and-genius/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Simon Willison — Fable 5 permanent -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cdn.sanity.io/images/4zrzovbb/website/6d4a0d28992ade92d6fa63646fd9c9d318245c6c-2400x1260.jpg" alt="Anthropic Claude Fable 5 hero image used in Anthropic's Fable 5 announcement." width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-18</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Simon Willison — Anthropic makes Fable 5 permanent in Max and Team Premium</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Simon Willison walks through Anthropic's July 18 reversal — Fable 5 stays in Max and Team Premium plans instead of moving to credits.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://simonwillison.net" style="color: #f7ff00;">Simon Willison</a>'s July 18 post breaks down a new Anthropic announcement: starting July 20, Claude Fable 5 is bundled into all Max and Team Premium subscriptions at 50% of each plan's weekly usage limits — reversing the plan to move Fable 5 to usage-credit-only on July 19.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Willison argues competitive pressure from GPT-5.6 Sol and Kimi K3 made a Max plan that excluded Anthropic's flagship model untenable. Pro and Team Standard users lose bundled access but get the usage-credit path plus a one-time $100 credit to soften the switch.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
For Max and Team Premium subscribers, Fable 5 stops being a usage-credit purchase and goes back to being part of the plan they already pay for. Willison flags the trade-off: keeping Fable 5 at 50% limits chews up serving GPUs that were originally earmarked for training.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
<a href="https://claude.ai" style="color: #f7ff00;">Claude</a> Max and Team Premium subscribers, and anyone tracking frontier-lab pricing strategy as the competition between Anthropic, OpenAI, and Moonshot heats up.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Simon Willison</td>
<td align="right"><a href="https://simonwillison.net/2026/Jul/18/claude-make-fable-5-permanent/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: OvisOCR2 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cdn-thumbnails.huggingface.co/social-thumbnails/models/ATH-MaaS/OvisOCR2.png" alt="OvisOCR2 model card banner on Hugging Face — ATH-MaaS's 0.8B document parser" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-07-15</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">OvisOCR2 — 0.8B Alibaba model tops OmniDocBench and beats pipeline OCR</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Alibaba's 0.8B end-to-end document parser sets state of the art on OmniDocBench v1.6.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
OvisOCR2 is a compact 0.8B open-weight document-parsing model from <a href="https://huggingface.co/ATH-MaaS" style="color: #f7ff00;">Alibaba's ATH-MaaS team</a>. Given a page image, it emits a single Markdown file in natural reading order — body text, tables, formulas, and figure regions — with no separate detector, layout, or formula pipeline required.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The model post-trains Qwen3.5-0.8B on real documents and HTML-derived synthetic pages, then applies supervised fine-tuning, reinforcement learning on a larger 4B teacher, on-policy distillation back to 0.8B, and model fusion. Rewards score text fidelity, formula accuracy, and table structure separately.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
OvisOCR2 hits 96.58 on OmniDocBench v1.6 — the first end-to-end model to top a leaderboard that was dominated by pipeline stacks chaining several specialists. At 0.8B and Apache-2.0, teams can run a SOTA document extractor on a single consumer GPU.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Teams building RAG pipelines, document AI, or on-device document extraction. Try it at <a href="https://huggingface.co/ATH-MaaS/OvisOCR2" style="color: #f7ff00;">huggingface.co/ATH-MaaS/OvisOCR2</a> with <a href="https://huggingface.co/spaces/ATH-MaaS/OvisOCR2" style="color: #f7ff00;">an online demo available</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Alibaba</td>
<td align="right"><a href="https://arxiv.org/abs/2607.13639" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
