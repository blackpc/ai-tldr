<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: MCP Enterprise-Managed Authorization -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://blog.modelcontextprotocol.io/og-image.png" alt="Model Context Protocol blog announcement card for Enterprise-Managed Authorization" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-18</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">MCP Enterprise-Managed Authorization — zero-touch OAuth for Claude, VS Code, Linear</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">MCP's new Enterprise-Managed Authorization extension stabilizes — admins authorize MCP connectors once through Okta, users skip per-app OAuth.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Enterprise-Managed Authorization (EMA) is an extension to the Model Context Protocol that just moved from draft to stable. EMA lets a company's identity provider — Okta at launch — grant access to MCP servers in bulk, scoped to user groups and roles. End users open Claude or VS Code, sign in once, and inherit every MCP connector their admin already approved without seeing an OAuth screen.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
EMA leans on the Identity Assertion JWT Authorization Grant (ID-JAG) standard. During single sign-on, the MCP client receives an ID-JAG from the IdP and exchanges it for an access token at the MCP server, replacing the per-server consent screen. Admins enable specific MCP servers in the IdP, set group scopes, and audit usage through the same IdP logs they use for SaaS.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Per-user OAuth on every MCP server is the main reason MCP has not landed in regulated enterprises — security teams want a single audit log and a single revoke button. With EMA stable, an admin can plug an MCP server into Okta the same way they plug in any SaaS, and rollouts the size of Ramp's 2,000-employee deployment become routine.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Enterprise IT, security teams, and MCP server maintainers who need centralized provisioning and auditing for AI tool access.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Model Context Protocol</td>
<td align="right"><a href="https://ai-tldr.dev/releases/mcp-enterprise-managed-auth-jun18" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: OpenAI Codex Record & Replay -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://developers.openai.com/og/codex/record-and-replay.png" alt="OpenAI Codex Record and Replay feature page social card" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-18</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">OpenAI Codex Record &amp; Replay — demonstrate a macOS workflow, get a reusable skill</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">OpenAI Codex 26.616 lets you record a Mac workflow once, then replay it as a reusable agent skill.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Record &amp; Replay is a new feature in the OpenAI Codex desktop app, shipped in version 26.616. The user demonstrates a workflow on their Mac — clicks, typing, window switches — and Codex captures the actions and visible window content, then turns the recording into an inspectable, editable skill the agent can replay later.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
After starting a recording, Codex watches both the actions taken and the surrounding window state, then synthesizes a skill the agent can run on its own. Each skill is editable after capture: prompts, branches, and action steps can be refined without re-recording. Record &amp; Replay rides on top of Codex's existing Computer Use capability.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Codex pitches Record &amp; Replay for tasks that are "easier to show than to describe" — filing an expense report, submitting a time-off request, running a recurring data export. Spelling those out in a prompt was the friction point that pushed many repetitive workflows out of Computer Use.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
macOS users of the Codex desktop app running Computer Use workflows. Note: not available in the EEA, UK, or Switzerland at launch.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenAI</td>
<td align="right"><a href="https://ai-tldr.dev/releases/openai-codex-record-and-replay" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Midjourney Medical -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cdn.midjourney.com/static/medical/media/posters/cinematic_video-646940207fc28381-2.jpg" alt="Midjourney Medical Ultrasonic CT scanner — cinematic poster of the underwater scanning ring" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SHOWCASE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-17</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Midjourney Medical — full-body ultrasonic CT scanner, 60-second scan, SF spa in 2027</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Midjourney spins up a hardware division and unveils a full-body ultrasound scanner inside a planned San Francisco spa.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Midjourney Medical is a new division of Midjourney that builds Ultrasonic CT, a full-body ultrasound scanner. The first scanner takes about a minute to capture a 3D body image using sound waves in water — no radiation, no magnets — and will live inside the Midjourney Spa opening in San Francisco at the end of 2027.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The scanner uses 8,960 ultrasound transducers wrapped around 40 Butterfly Network ultrasound-on-chip modules. The patient descends into a shallow pool of water and passes through a ring of underwater sensors that fire sound waves through the body from every angle, producing a 3D full-body image in ~60 seconds.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Midjourney is the first major generative-AI company to ship a real hardware product. The spa-and-scan delivery model is unusual — Midjourney is selling scans direct to consumers rather than to hospitals, targeting 50,000 scanners and 1 billion scans per month by 2031.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI watchers tracking hardware bets from software companies, medical-imaging engineers, and consumer-health investors.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Midjourney</td>
<td align="right"><a href="https://ai-tldr.dev/releases/midjourney-medical-jun17" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: LifeSciBench -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://www.marktechpost.com/wp-content/uploads/2026/06/blog1912-1024x731.png" alt="LifeSciBench announcement card — OpenAI's 750-task life-science benchmark" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">BENCHMARK</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-17</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">LifeSciBench — OpenAI's 750-task benchmark for life-science research</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">OpenAI's new biology benchmark grades models with expert rubrics, and even GPT-Rosalind passes only one task in three.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
LifeSciBench is OpenAI's new evaluation suite for AI in life-science research. It contains 750 free-response tasks across seven biology workflows and seven domains, written by 173 PhD-level scientists from biotech and pharma — graded by rubric rather than multiple choice.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
LifeSciBench grades model output with 19,020 expert-written criteria — about 25 per task — tracking a normalized rubric score and a task pass rate at the 70% threshold. About 53% of tasks include attached artifacts (figures, PDFs, sequence files, chemical structures) that models must read and interpret.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
LifeSciBench gives biotech teams a hard, realistic yardstick for picking models to run scientific workflows. Even the strongest model, GPT-Rosalind, passes only 36.1% of tasks — and that drops to 28.1% when files are attached, revealing that artifact-handling is the field's main bottleneck.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI evaluation researchers, biotech and pharma teams deploying LLMs for scientific workflows, and anyone tracking the state of AI in biology.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenAI</td>
<td align="right"><a href="https://ai-tldr.dev/releases/openai-lifescibench" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Superpowers v6.0 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/1/obra/superpowers" alt="Superpowers GitHub repository social card by Jesse Vincent" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-16</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Superpowers v6.0 — Jesse Vincent's agentic-skills framework, ~2x faster reviews</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">v6.0 makes Superpowers' subagent-driven review loop run twice as fast and burn half the tokens.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Superpowers is a software-development methodology and skills framework for AI coding agents — 232k GitHub stars, MIT licensed. It ships composable skills plus an instruction layer that steers the agent through brainstorm, plan, TDD implementation, and review.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Version 6.0 dispatches one reviewer per task instead of two, with that reviewer returning both spec-compliance and quality verdicts at once. Diffs and task text now move as files rather than inline text, cutting context cost. The controller must explicitly pick a model for every dispatch, blocking silent upgrades to a more expensive tier.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Superpowers users running Claude Code or Codex through the framework now get the same review quality at roughly twice the speed and ~50% lower token spend. The release also lands first-class harness support for Kimi Code, Pi, and Antigravity.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers using Claude Code, Codex, Cursor, or any of the 11+ supported coding agents who want structured, subagent-driven code review.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Prime Radiant</td>
<td align="right"><a href="https://ai-tldr.dev/releases/obra-superpowers-v6" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Simon Willison: GLM-5.2 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://static.simonwillison.net/static/2026/glm-5.2-pelican-card.jpg" alt="Simon Willison social card for GLM-5.2 post showing his SVG pelican benchmark" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-17</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Simon Willison: GLM-5.2 is probably the most powerful text-only open weights LLM</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Simon Willison ranks GLM-5.2 as today's top open-weights text LLM — frontier-class scores at roughly a quarter of GPT-5.5's price.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Simon Willison argues that Z.ai's GLM-5.2 — a 753B-parameter Mixture-of-Experts model, MIT licensed, 1M-token context — is currently the strongest text-only open-weights LLM. It tops Artificial Analysis Intelligence Index v4.1 at score 51 and sits second on Code Arena's WebDev leaderboard behind only Claude Fable 5.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Willison runs GLM-5.2 through OpenRouter at ~$1.40/$4.40 per million input/output tokens — well below GPT-5.5's $5/$30. He notes one catch: GLM-5.2 uses ~43k output tokens per task vs 26k for GLM-5.1, which dents cost savings on long agent runs.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
GLM-5.2 closes most of the gap to the closed frontier on coding and general intelligence at a quarter to a sixth of the price. Willison's framing sets the open-weights conversation: GLM-5.2 is now the default candidate for "self-host or cheap API."
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI engineers comparing open-weights models, OpenRouter and self-host users, and cost-sensitive teams evaluating alternatives to closed frontier models.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Simon Willison</td>
<td align="right"><a href="https://ai-tldr.dev/releases/simonw-glm-5-2-most-powerful-jun17" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: ChatGPT Scheduled Tasks Hub -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://www.engadget.com/img/gallery/chatgpt-now-has-a-hub-for-scheduled-tasks/l-intro-1781728946.jpg" alt="ChatGPT's new Scheduled Tasks page with sidebar entry" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-17</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">ChatGPT Scheduled Tasks Hub — sidebar page replaces Pulse</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">ChatGPT moves scheduled prompts into a single sidebar Scheduled page and retires Pulse in 14 days.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
ChatGPT Scheduled Tasks is OpenAI's redesigned home for recurring prompts inside ChatGPT. A new Scheduled page in the sidebar lists every active task with its next run time and lets users pause, resume, edit, or delete it without scrolling through chat threads.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Scheduled Tasks runs each saved prompt on its own cadence — a specific time or a window like morning, afternoon, or evening — capped at once per hour. Monitoring tasks can search the web and check connected apps, notifying users only when something material changes.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Scheduled Tasks pulls automated ChatGPT work out of buried chat threads and into a managed surface. The launch also retires Pulse, OpenAI's earlier proactive-summary feature, which sunsets in 14 days.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
ChatGPT Go, Plus, Pro, Business, and Enterprise subscribers running daily or weekly automations and monitoring tasks.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenAI</td>
<td align="right"><a href="https://ai-tldr.dev/releases/openai-chatgpt-scheduled-tasks-hub-jun17" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
