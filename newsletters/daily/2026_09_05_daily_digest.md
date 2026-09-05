<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Claude Code 2.1.261 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/5bb27a89025fc5d46fed28f8785bfc7e078c53f50d43b568809800fbc51e9f5c/anthropics/claude-code/releases/tag/v2.1.261" alt="Claude Code v2.1.261 release page on GitHub" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-04</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Claude Code 2.1.261 — /skill-doctor shows which skills waste your context</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Claude Code 2.1.261 adds a skill audit, much bigger inline output limits, and a stricter rm -rf safety check.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
A new /skill-doctor command reports which loaded skills a session never used and what each one costs in context, so you can drop the ones that are only taking up room. The release also adds --append-subagent-system-prompt-file for subagent prompts too large to pass on the command line.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Two new settings, bashOutputMaxChars and taskOutputMaxChars, raise the ceiling for inline command and background-task output to 128K characters. /status and claude doctor also gain an "Organization policy" line that explains why a managed policy could not be loaded.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
The dangerous-rm prompt now also catches rm -rf on positional parameters and inside double-quoted sh -c scripts, and auto mode stops auto-approving links that pack content into a public diagram renderer's URL. Prompt word-editing keys switch to Bash behaviour, superseding the keybindingFlavor setting.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Claude Code users and the admins who manage them. Install with: npm i -g @anthropic-ai/claude-code@2.1.261
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Anthropic</td>
<td align="right"><a href="https://github.com/anthropics/claude-code/releases/tag/v2.1.261" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: OpenEvidence model family -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://www.unite.ai/wp-content/uploads/2026/09/openevidence-launches-medical-ai-model-family-with-darwin-preview.jpg" alt="OpenEvidence medical AI model family launch with Darwin research preview" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-03</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">OpenEvidence model family — Osler, Sackett and Snow ship free to clinicians</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Four medical AI models that all aim at the same accuracy — what changes is how long each one thinks.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
OpenEvidence now ships a named model family instead of one search box. Osler answers in about five seconds and is the new default; Sackett takes about thirty seconds for evidence-strength questions; Snow takes about five minutes and reads through the medical literature before writing anything.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Every model is held to the same standard of clinical accuracy — the difference is time and search depth. Snow replaces the older Deep Consult feature and runs a full literature investigation. A separate oncology sub-agent draws on a precision oncology knowledge base alongside NCCN treatment algorithms and ASCO guidelines.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Clinicians can now match the wait to the question. Osler, Sackett and Snow are free for the platform's 1.12 million license-verified U.S. clinicians. The fourth model, Darwin, achieves a perfect 660/660 on MedQA but stays in research preview because of dual-use risk in virology and genetics work.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Practising clinicians and clinical AI researchers. Available at <a href="https://www.openevidence.com" style="color: #f7ff00;">openevidence.com</a> and on iOS and Android.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenEvidence</td>
<td align="right"><a href="https://www.unite.ai/openevidence-launches-medical-ai-model-family-with-darwin-preview/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Daybreak for Frontline Defenders -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://img.helpnetsecurity.com/wp-content/uploads/2026/06/08084558/openai_texture-1500.webp" alt="OpenAI wordmark on a textured background" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-03</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Daybreak for Frontline Defenders — $1B of OpenAI cyber credits for utilities</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">OpenAI will subsidize $1 billion of Daybreak cyber-model use for under-resourced defenders of essential services.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Daybreak for Frontline Defenders opens OpenAI's cyber models to organizations that keep essential services running but cannot pay enterprise rates. Water utilities, electric grids, local governments, community banks, nonprofits and open-source maintainers can apply for subsidized credits, training and hands-on technical support.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Defenders are routed to two existing Daybreak tiers: Daybreak Blue for common defensive work on mainline models, and Daybreak Red for specialized cyber tasks. Teams use them to review legacy code, analyze suspicious activity, find and rank vulnerabilities, and write fixes. A pilot with the Multi-State Information Sharing and Analysis Center adds training for state, local, tribal and territorial defenders.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Small utilities and city IT teams defend complex, aging systems with very little staff and budget, while frontier cyber models have been priced for large enterprises. The MS-ISAC pilot alone covers utilities in 40 states plus DC that serve more than half the US population. OpenAI expects the $1B to be used over about six months.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Critical-infrastructure and public-sector security teams. US organizations first; partner countries in coming weeks.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">OpenAI</td>
<td align="right"><a href="https://www.securityweek.com/openai-pledges-1-billion-to-bring-frontier-ai-to-critical-infrastructure-defenders/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: EEBench -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://eebench.org/src/can-ai-design-circuit-boards-yet.png" alt="EEBench post asking whether AI can design circuit boards yet" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">BENCHMARK</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-04</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">EEBench — atopile's benchmark scores frontier models on circuit design</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A simulation-graded benchmark that asks whether AI models can design circuit boards that actually work.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
EEBench V1 puts frontier models through 13 circuit-design tasks spanning analog and digital design, and grades answers with physics — not a human vote. Claude Opus 5 leads the first leaderboard at 61.6%, ahead of Grok 4.6 at 57.1% and GPT-5.6 Sol at 39.4%.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Models write atopile design code — so the grader can read components, connections and electrical constraints directly — then each submission is run through SPICE simulation and design checks at worst-case component corners. A final score weights technical performance at 0.65 and cost efficiency against a reference BOM at 0.35.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Hardware has had no SWE-bench of its own, so claims that a model could design a working circuit were hard to verify. EEBench turns it into a number, and the spread is wide enough to be meaningful — 22 percentage points separate the leader from GPT-5.6 Sol.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Hardware engineers and model evaluators. Full leaderboard, per-task scores and cost breakdowns at <a href="https://eebench.org/" style="color: #f7ff00;">eebench.org</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">atopile</td>
<td align="right"><a href="https://eebench.org/blog/can-ai-design-circuit-boards-yet/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: humain-m3 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://www.unite.ai/wp-content/uploads/2026/09/humain-unveils-humain-m3-arabic-model-minimax-research-preview.jpg" alt="HUMAIN announces humain-m3, its frontier Arabic language model built by MiniMax" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-03</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">humain-m3 — a 428B Arabic model HUMAIN commissioned from MiniMax</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Saudi Arabia's HUMAIN commissioned a 428B Arabic frontier model from MiniMax and opened it as a limited preview.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
humain-m3 is a 428-billion-parameter mixture-of-experts model (23B active per token) announced by HUMAIN at LEAP in Riyadh. Built on the MiniMax-M3 lineage, it was further pre-trained on more than a trillion tokens of Arabic-native content.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
HUMAIN paid MiniMax to continue pre-training M3 on Arabic data rather than training from scratch. The preview period is used to check capability, safety and alignment across Arabic dialects. On seven public Arabic benchmarks the model averages 89.37%, leading five of the seven — its widest margin is on AraTrust (97.53% vs 93.42% for GPT-5.6 SOL).
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Arabic is spoken by hundreds of millions yet stays thinly covered by frontier models. The other signal is geopolitical: a Gulf state's national AI programme licensed a Chinese lab's model rather than building its own. HUMAIN plans to release weights under the MiniMax Community License once safety work is done.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Teams building Arabic-language products. Request limited preview access at <a href="https://node.humain.com/" style="color: #f7ff00;">node.humain.com</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">HUMAIN</td>
<td align="right"><a href="https://www.prnewswire.com/news-releases/humain-unveils-humain-m3-a-frontier-arabic-language-model-developed-by-minimax-in-research-preview-on-humain-node-302869158.html" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Simon Willison GPT-6 Astra pelicans -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://static.simonwillison.net/static/2026/astra-social-2.jpg" alt="Simon Willison's SVG pelican-riding-a-bicycle drawings compared across GPT-6 Astra and GPT-5.6 models" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-04</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Simon Willison — GPT-6 Astra draws far better pelicans than GPT-5.6</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A side-by-side grid puts GPT-6 Astra against three GPT-5.6 models at every reasoning level.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Simon Willison published a comparison grid of SVG pelicans riding bicycles, drawn by GPT-6 Astra at low, medium, high, xhigh and max reasoning effort, next to GPT-5.6 Sol, Terra and Luna. The pelican prompt is his informal test for every new model.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Every cell records input tokens, output tokens and cash cost, priced from published rates. At max effort GPT-6 Astra cost 63.21 cents for one drawing; its cheapest run (low effort) cost 9.55 cents — and still beat every GPT-5.6 Sol result.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Reasoning effort moves the bill as much as the model choice — one pelican ranges from 1.57 to 63.21 cents across the grid. Willison also spotted that Astra and Luna both used 16 input tokens while Sol and Terra used 26, and speculates the two may be more closely related than OpenAI has said.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers choosing a model and reasoning level — useful quick signal on how much quality Astra's low-effort tier buys at 9.55 cents vs paying 6× more for max.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Simon Willison</td>
<td align="right"><a href="https://simonwillison.net/2026/Sep/4/astra-pelicans/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Compile by Training -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://programasweights.com/og.png?v=2" alt="ProgramAsWeights — define functions in English and run them locally" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">PAPER</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-09-03</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Compile by Training — turn an English spec into a local neural function</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Describe a fuzzy text function in English, wait about a minute, and get a .paw file that runs locally with no API calls.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Compile by Training is a new compiler for ProgramAsWeights (PAW) that turns a natural-language description into a reusable neural program you can run offline. It reaches 83.6% semantic accuracy on FuzzyBench-Hard, where the older fast compiler scored 22.4%.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Teacher models generate example input-output pairs from the spec, which finetune a compact adapter over a small fixed interpreter. The result is packaged as a .paw file that needs no further model calls at runtime. Compilation takes about 51 seconds on a B300 GPU.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Small fuzzy text jobs — sentiment labels, PII typing, format cleanup — usually mean one API call per invocation. ProgramAsWeights turns each into a local file with a name and a version, storable and reusable like any other module, with no ongoing API cost.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers shipping small text-processing features. Try it: <code style="background: #181818; color: #f7ff00; padding: 2px 6px;">uv run compile.py "Classify sentiment. Return only positive, negative, or neutral." -o sentiment.paw</code>
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">ProgramAsWeights</td>
<td align="right"><a href="https://arxiv.org/abs/2609.04199" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
