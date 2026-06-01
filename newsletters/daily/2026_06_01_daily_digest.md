<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: PromptArmor: ChatGPT for Google Sheets Exfiltrates Workbooks -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://framerusercontent.com/images/eJKU8yDyAKTNNHfYvQqWDm5e25s.png" alt="PromptArmor report header for ChatGPT for Google Sheets workbook exfiltration" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-01</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">ChatGPT for Google Sheets Exfiltrates Workbooks — One Poisoned Sheet Steals Up to 12</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">One hidden instruction in a shared sheet hijacks the ChatGPT Sheets extension and walks out with workbooks across the user's account.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
PromptArmor disclosed an indirect prompt injection in OpenAI's ChatGPT for Excel and Google Sheets extension — the official sidebar that lets users ask GPT to read and edit a sheet. A single poisoned sheet can trigger silent data exfiltration and overlay a fake chatbot, with no extra clicks from the user.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Untrusted data in a sheet hides instructions for the model. When the user asks a benign question, the extension follows the hidden directions instead and emits Apps Script that reads other open workbooks, posts their contents to an attacker endpoint, and rewrites cells to render a phishing chatbot — up to 12 workbooks pulled per attack.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
This is the first major prompt injection to land on the official OpenAI extension, which has 185,000+ installs across Workspace tenants. OpenAI removed the model's ability to generate Apps Script after disclosure and acknowledged the report had been stuck in their automated queue since May 8.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Workspace admins and security teams running the ChatGPT Sheets extension — restrict it via Admin Console &gt; Apps &gt; Marketplace apps until a full fix lands.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">PromptArmor</td>
<td align="right"><a href="https://www.promptarmor.com/resources/gpt-for-google-sheets-data-exfiltration" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Gemini Spark US Public Beta -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://i0.wp.com/9to5google.com/wp-content/uploads/sites/4/2026/05/Gemini-Spark-Availabillity.jpg?resize=1200%2C628&quality=82&strip=all&ssl=1" alt="Gemini Spark availability promo banner" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-05-29</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Gemini Spark Hits US Public Beta for Google AI Ultra Subscribers</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Google's I/O-announced personal agent goes from trusted-tester preview to a public beta inside the $100/month AI Ultra plan in the United States.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Gemini Spark is Google's always-on personal agent, announced at I/O 2026 on May 19 and now reaching all US Google AI Ultra subscribers in beta. It sits in a new 'Spark' tab in the Gemini app on web, Android, and iOS, built on Google's Antigravity agentic environment.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Spark runs tasks in Google's cloud — even when your phone is locked — against Gmail, Calendar, Drive, Docs, Maps, and YouTube, plus third-party apps like Canva, OpenTable, and Instacart through MCP. Users describe goals as Tasks, set Schedules, and teach reusable Skills in natural language; it asks for confirmation before sending mail or completing transactions.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Spark is the first widely available, consumer-grade always-on agent from a frontier lab. It forces ChatGPT Agent, Claude Cowork, and Microsoft Copilot Actions to compete on real-world task completion rather than demo videos.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Google AI Ultra subscribers ($100/mo) in the US who want background automation across email, docs, and connected apps — up to 15 parallel tasks.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Google</td>
<td align="right"><a href="https://9to5google.com/2026/05/29/gemini-spark-ultra-us/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Simon Willison on Anthropic Containment -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-05-30</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">How Anthropic Sandboxes Claude — gVisor, Seatbelt, Bubblewrap, and Full VMs</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Simon Willison breaks down Anthropic's three-tier sandbox stack for Claude.ai, Claude Code, and Claude Cowork, including a red-team exfiltration story.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Simon Willison's link post pointing at Anthropic's engineering writeup "How we contain Claude across products." He flags it as the kind of public security documentation that AI tooling vendors usually keep behind closed doors.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Three containment patterns: Claude.ai sessions run in ephemeral gVisor containers; Claude Code runs locally with Seatbelt (macOS) or Bubblewrap (Linux) gated by per-action dialogs; Claude Cowork runs a full VM using Apple Virtualization (macOS) or HCS (Windows). The post also walks through a February 2026 red-team where phished-employee credentials were exfiltrated by Claude Code 24 of 25 attempts.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Most agent vendors won't say what isolation layer separates a tool call from your filesystem. Anthropic's transparency — including documenting the failure mode — gives security teams a concrete frame for evaluating other agent platforms.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Security engineers, platform teams, and developers shipping agentic tools who need to understand isolation guarantees before deploying Claude in production.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Simon Willison</td>
<td align="right"><a href="https://simonwillison.net/2026/May/30/how-we-contain-claude/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: OpenAI Codex 26.527 Windows Computer Use -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://developers.openai.com/og/codex/app/computer-use.png" alt="OpenAI Codex Computer Use documentation header" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-05-29</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">OpenAI Codex 26.527 — Computer Use Lands on Windows, Remote Control From iOS/Android/Mac</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Codex's screen-driving agent reaches Windows desktops, and ChatGPT mobile can now steer those Windows runs remotely.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Codex 26.527 adds Windows support for Computer Use — the feature that lets Codex visually drive desktop apps by taking screenshots, clicking, and typing — and pairs it with Remote Control, letting ChatGPT on iOS, Android, or another Mac steer a Windows Codex run.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
On Windows, Computer Use runs on the active desktop only — no background sessions like macOS. Remote Control routes prompts from ChatGPT mobile or Mac Codex back to the Windows host that owns the project files and local context. The same release adds thread coordination across worktrees and search across past Codex threads.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Computer Use was macOS-only since April. Bringing it to Windows opens screen-driving agentic workflows to the majority of developer desktops, including Windows-pinned enterprise users.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers on Windows who want a coding agent that can drive their desktop apps, and anyone who wants to steer a Codex run from their phone. (Unavailable in EEA, UK, Switzerland at launch.)
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenAI</td>
<td align="right"><a href="https://developers.openai.com/codex/app/computer-use" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: SoftBank France €75B Data Centers -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://techcrunch.com/wp-content/uploads/2025/07/GettyImages-2224533087.jpg?w=1024" alt="Masayoshi Son speaks at an event, illustrating SoftBank's AI infrastructure push" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-05-30</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">SoftBank Commits Up to €75B for 5 GW of AI Data Centers in France</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">SoftBank turns its OpenAI tie-up into a 5 GW European campus play, with EDF on power and Schneider on the Dunkirk build.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
An announced SoftBank Group investment of up to €75 billion (~$87B) to build 5 gigawatts of AI data center capacity in France. Phase one is €45B for 3.1 GW by 2031 across three Hauts-de-France sites — Dunkirk, Bosquel, and Bouchain.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
SoftBank provides capital while state-owned nuclear utility EDF supplies power and a former power-plant site at Bouchain. Schneider Electric joins as technology partner on the Dunkirk hub, pairing AI compute with robotics manufacturing. The deal was timed for the Choose France Summit.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Europe has lagged the US and China on gigawatt-scale compute builds. A 5 GW SoftBank campus anchored to nuclear baseload gives OpenAI-aligned workloads an EU-sovereign serving footprint and a flagship for France's post-Mistral industrial policy.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
EU enterprises buying sovereign inference, hyperscaler and neocloud watchers, and energy-grid planners tracking AI's nuclear power dependency.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">SoftBank Group</td>
<td align="right"><a href="https://techcrunch.com/2026/05/30/softbank-says-it-will-invest-up-to-e75-billion-to-build-french-data-centers/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Illinois SB 315 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://i0.wp.com/capitolnewsillinois.com/wp-content/uploads/2026/05/260527-DIDECH-JS-3124.jpg?fit=1140%2C760&quality=89&ssl=1" alt="Rep. Daniel Didech on the Illinois House floor during the SB 315 vote" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-05-28</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Illinois Gov. Pritzker to Sign SB 315 — First U.S. Mandate for Annual Independent AI Audits</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Illinois is about to become the first U.S. state to put outside auditors inside frontier AI labs, after a unanimous 110-0 House vote and a governor commitment to sign.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Gov. JB Pritzker publicly committed to sign SB 315, the Artificial Intelligence Safety Measures Act, after the House passed it 110-0. The law targets frontier developers with $500M+ annual revenue, requiring independent third-party audits, annual transparency reports, and 72-hour critical incident reporting.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Covered developers must publish and annually update a frontier AI framework covering risk assessment, mitigations, cybersecurity, and governance. They must file transparency reports before deploying or materially modifying a frontier model and submit to an independent third-party audit every year. Enforcement sits with the Illinois Attorney General, with civil penalties up to $3M per violation.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Illinois is the first state to require an outside auditor verify a safety framework, not just publish it. OpenAI endorsed the bill, arguing it creates a "de facto national framework" — useful with the White House also weighing a federal pre-release vetting order.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Frontier AI compliance teams, AI policy professionals, and state and federal regulators watching the emerging patchwork of U.S. AI safety mandates.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Illinois General Assembly</td>
<td align="right"><a href="https://www.pymnts.com/artificial-intelligence-2/2026/illinois-governor-vows-to-sign-ai-safety-bill/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Wix 1,000 Layoffs -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://media.thenextweb.com/2026/05/Avishai-Abrahami.avif" alt="Wix CEO Avishai Abrahami at a public event" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-05-28</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Wix Cuts 1,000 Jobs — 20% of Workforce — as AI-Native Builders Eat Into Demand</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Wix's biggest layoff ever blames AI competition and an expensive shekel as the website builder rebuilds around 'xEngineers' and 'Creators'.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Wix is eliminating about 1,000 of its 5,277 employees — roughly one in five — in its largest round of cuts to date. CEO Avishai Abrahami cited both a currency mismatch (shekel at a 33-year high, 60%+ of staff Israel-based) and an AI-driven restructuring.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Wix is restructuring around two new role archetypes: 'xEngineer' (design-first generalists who own features end-to-end with AI tools) and 'Creators' (AI-tool-centric product roles). The Harmony AI site-generation product is meant to keep Wix competitive against vibe-coding entrants <a href="https://lovable.dev" style="color: #f7ff00;">Lovable</a> ($1.8B valuation) and <a href="https://bolt.new" style="color: #f7ff00;">Bolt.new</a>.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Wix is one of the first large SaaS companies to put AI explicitly on the marquee as a cause of a 1,000-person cut. It joins Cloudflare (1,100), Meta (8,000), and Intuit (3,000) in a clear pattern of AI-driven SaaS restructuring in May 2026.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
SaaS investors, web-dev contractors watching the vibe-coding stack, and Israeli tech workforce watching AI reshape no-code platforms.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Wix</td>
<td align="right"><a href="https://thenextweb.com/news/wix-is-cutting-20-of-its-workforce-as-a-strong-shekel-and-ai-competition-squeeze-the-website-builder-from-both-sides" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
