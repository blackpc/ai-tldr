<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Rio 3.5 Open 397B -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/04f1551c5a62546c1dd9c9a478b1462b32444b66fbf27065a4fd61c3bcbeff59/nex-agi/Nex-N2/issues/4" alt="GitHub issue showing weight-merge analysis of Rio 3.5 Open 397B against Nex-N2-Pro and Qwen3.5" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-14</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Rio 3.5 Open 397B — Brazil's 'homegrown' LLM is a Nex-N2 + Qwen merge</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Researchers say Rio's city-built 397B 'open Brazilian LLM' is in fact a weight-merge of two existing Chinese models.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Prefeitura do Rio de Janeiro (<a href="https://huggingface.co/prefeitura-rio/Rio-3.5-Open-397B" style="color: #f7ff00;">IplanRIO</a>) uploaded Rio 3.5 Open 397B to Hugging Face as a city-built foundation model. <a href="https://github.com/nex-agi/Nex-N2/issues/4" style="color: #f7ff00;">Nex-AGI researchers</a> showed it's actually a 60/40 element-wise weight-merge of Nex-N2-Pro and Qwen3.5-397B-A17B.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Two checks confirmed it: the model identifies itself as Nex-AGI ~79% of the time without a system prompt, and every tensor across all 60 layers shows the exact 0.6/0.4 ratio a direct weight merge produces — a pattern fine-tuning cannot replicate.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
It's the latest in a string of "national AI" launches that are repackaged weights — a concrete case for why provenance audits matter when a public-sector agency treats an open-weights file as its own asset. IplanRIO has acknowledged an "incorrect upload."
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Procurement teams, policymakers, and open-weights developers evaluating sovereign AI claims.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">Nex-AGI</td>
<td align="right" style="padding-top: 16px;"><a href="https://github.com/nex-agi/Nex-N2/issues/4" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Amazon's Jassy Pushed Anthropic Crackdown -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://techcrunch.com/wp-content/uploads/2022/07/GettyImages-1348139958.jpg?resize=1200,767" alt="Amazon CEO Andy Jassy at a podium" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-13</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Amazon's Jassy Pushed Anthropic Crackdown — flagged Fable 5 jailbreak risk</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">WSJ scoop: Amazon CEO Andy Jassy warned Treasury that Claude Fable 5 leaked cyberattack info — the US ban followed.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
A <a href="https://techcrunch.com/2026/06/13/amazon-ceo-reportedly-raised-anthropic-model-concerns-before-government-crackdown/" style="color: #f7ff00;">Wall Street Journal report</a> names Amazon CEO Andy Jassy as the person who triggered the export-control directive that froze worldwide access to <a href="https://www.anthropic.com/news/fable-mythos-access" style="color: #f7ff00;">Claude Fable 5 and Mythos 5</a> — by raising the concerns directly with Treasury Secretary Scott Bessent.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Amazon's own researchers reportedly jailbroke Fable 5 to return exploit-relevant output; Jassy escalated to Treasury, and the Trump administration directed Anthropic to block all foreign nationals from accessing Fable 5 and Mythos 5 — which Anthropic implemented as a worldwide shutdown.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
This is the first US AI export control triggered by a named private-sector customer's red-team finding — not independent government testing — setting the template for how future model restrictions can be opened.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Anthropic API customers, AI policy watchers, and security researchers tracking the Fable fallout.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">Amazon</td>
<td align="right" style="padding-top: 16px;"><a href="https://techcrunch.com/2026/06/13/amazon-ceo-reportedly-raised-anthropic-model-concerns-before-government-crackdown/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Google Sues 'Outsider Enterprise' -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Combat_AI_Scams_hero.width-1300.png" alt="Google graphic announcing action against AI-powered phishing scams" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-12</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Google Sues 'Outsider Enterprise' — Chinese scam ring abused Gemini</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">First time Google has gone to court over Gemini abuse — and the defendant is a phishing-as-a-service ring that used AI to spin up 9,000+ fake websites.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://blog.google/innovation-and-ai/technology/safety-security/combatting-ai-scams/" style="color: #f7ff00;">Google filed a civil lawsuit</a> against Outsider Enterprise, a China-based phishing-as-a-service network that used <a href="https://gemini.google.com" style="color: #f7ff00;">Gemini</a> to mass-produce fake login pages impersonating Google, YouTube, USPS, and E-ZPass.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The ring sold 290+ phishing templates and asked Gemini to write innocuous-sounding "gift redemption" pages, then imported the generated HTML into its kit. Affiliates sent 2.5 million scam SMS messages in a single two-week window, targeting Android users.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
It's the first lawsuit a major AI provider has filed against an end-to-end abuse network built on its own model — the civil-suit-plus-FBI-takedown playbook sets a precedent other labs are likely to copy.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI safety teams, trust-and-safety engineers, and security researchers tracking AI-powered cybercrime.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">Google</td>
<td align="right" style="padding-top: 16px;"><a href="https://blog.google/innovation-and-ai/technology/safety-security/combatting-ai-scams/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: UK Police Officer AI Evidence -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://www.derbyshiretimes.co.uk/webimg/b25lY21zOjM5N2QzYzZkLWI3ZDMtNGQ3MC1hYzZlLTJiNzJiYzFhMzVkNzozODU2ZTg3ZS04ZWE1LTRlYmMtYWIyNS1kMDM1YWNiOTkzZDI=.jpg?width=1200&auto=webp&quality=75&crop=3:2,smart&trim=" alt="Derbyshire Times report on the police officer AI evidence investigation" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-12</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">UK Police Officer Under Investigation for Using AI to Fake Evidence</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A UK police officer used generative AI to fabricate evidence in real cases — the country's first known criminal investigation of its type.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Derbyshire Constabulary has pulled a serving officer from frontline duty after the <a href="https://www.bbc.com/news/articles/cy8wppwdxl6o" style="color: #f7ff00;">Crown Prosecution Service</a> confirmed a criminal inquiry into alleged use of generative AI to create evidence in a number of cases.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The exact AI tool and the form of the fabricated material have not been disclosed. The <a href="https://oecd.ai/en/incidents/2026-06-12-ca05" style="color: #f7ff00;">OECD-AI Incident Registry</a> classifies it as content-generation misuse by a public official, and the CPS is engaging with defence teams and courts on every affected case.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
It sets the first concrete UK precedent for AI-assisted evidence fabrication inside the justice system — every case worked by the officer is now at risk of being reopened or thrown out.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Policymakers, defence lawyers, and AI policy teams writing governance rules for law enforcement.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">Crown Prosecution Service</td>
<td align="right" style="padding-top: 16px;"><a href="https://www.derbyshiretimes.co.uk/news/crime/derbyshire-police-officer-under-investigation-for-using-ai-to-create-evidence-8691004" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: GLM-5.2 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-13</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">GLM-5.2 — Z.ai's new flagship coding model with 1M context</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Z.ai's new coding flagship lands first inside the GLM Coding Plan, with API, chatbot, and open weights set for next week.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://docs.z.ai/devpack/latest-model" style="color: #f7ff00;">GLM-5.2</a> is the new flagship coding model from <a href="https://z.ai" style="color: #f7ff00;">Z.ai</a> (formerly Zhipu AI), succeeding GLM-5.1 with a 1,000,000-token context window and a 131,072-token max output, available now to GLM Coding Plan subscribers.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Two thinking-effort levels — high and max — are selected with the <code style="background: #181818; padding: 2px 5px; font-family: Menlo, Consolas, monospace;">/effort</code> command. It integrates directly with <a href="https://claude.ai/code" style="color: #f7ff00;">Claude Code</a>, Cline, Roo Code, and Goose by overriding the Anthropic model environment variables.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
1M context is useful for whole-repo refactors and multi-hour agent runs — and the MIT-licensed open weights land next week, arriving just as Claude Fable 5 has been suspended from public access.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers running agentic coding workflows who want a long-context, open-route alternative to API-only models.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">Z.ai</td>
<td align="right" style="padding-top: 16px;"><a href="https://docs.z.ai/devpack/latest-model" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: TensorZero Archives Its Repo -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://repository-images.githubusercontent.com/829640443/56e9b8da-eabc-4dff-bac7-73d459e7880d" alt="TensorZero GitHub social preview" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-12</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">TensorZero archives its repo — open-source LLMOps gateway winds down</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">An 11,560-star Rust LLM gateway shuts down 8 months after seed, leaving Apache-2.0 code in place but unmaintained.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://github.com/tensorzero/tensorzero" style="color: #f7ff00;">TensorZero</a> was an open-source LLMOps platform bundling multi-provider routing, observability, evaluation, and experimentation behind a single API, written mostly in Rust and claiming under-1ms p99 overhead. Its GitHub repo is now archived and read-only.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Co-founder Gabriel Bianconi wrote that they spent less than half their $7.3M seed and returned the rest, explaining the problem as needing product-market fit twice — once for the OSS and once for the commercial product — in a market that shifted under them.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Teams running TensorZero should plan a migration now: with the repo archived, no security patches or new provider integrations are coming. Open-source LLMOps as a venture-backed category just got harder to justify.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Teams self-hosting LLM gateways or evaluating LLMOps tooling who need to plan their next move.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">TensorZero</td>
<td align="right" style="padding-top: 16px;"><a href="https://github.com/tensorzero/tensorzero" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Ahmad Osman: Open Source AI Must Win -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opensourceaimustwin.com/og-image.png" alt="Open Source AI Must Win manifesto cover graphic" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-13</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Ahmad Osman: 'Open Source AI Must Win' — manifesto on the right to run AI locally</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A one-page argument that open AI you can run yourself is critical infrastructure, not a niche preference — 774 points on Hacker News.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
A short manifesto by engineer <a href="https://ahmadosman.com/" style="color: #f7ff00;">Ahmad Osman</a> at <a href="https://opensourceaimustwin.com/" style="color: #f7ff00;">opensourceaimustwin.com</a>, arguing that open weights, local inference, and reproducible models are existential infrastructure — not a niche preference over API convenience.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Osman lists six properties open AI must preserve — usable, understandable, reproducible, locally deployable, economically viable, and community-governed — and spells out what closed AI takes away in practice: access tied to a single API, model availability that can be revoked, and prices set by a handful of firms.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
The piece arrived the day after Anthropic suspended Claude Fable 5 under a US national-security order, making "what if the API just turns off" a live question — and it spread fast, reaching 774 HN points and 239 comments within 12 hours.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Open-weight users, self-hosters, and policy watchers tracking the closed-vs-open AI fight.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="padding-top: 16px; font-size: 14px; font-weight: 700; color: #f5f5f0;">Ahmad Osman</td>
<td align="right" style="padding-top: 16px;"><a href="https://opensourceaimustwin.com/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
