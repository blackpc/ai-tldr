<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: Cloudflare Temporary Accounts -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cf-assets.www.cloudflare.com/zkvhlag99gkb/60PB1NmcYFywT5TDlwDR0v/a9e72c980e108702e00b57343ea1ccb2/OG_Share_2024-2025-2026__39_.png" alt="Cloudflare blog header for Temporary Accounts for AI agents" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-19</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Cloudflare Temporary Accounts — AI agents deploy live Workers in seconds, no signup</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Cloudflare's <code>wrangler deploy --temporary</code> spins up a live Workers account for an AI agent in seconds, with no signup or browser OAuth.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
A new deployment mode in <a href="https://developers.cloudflare.com/workers/wrangler/" style="color: #f7ff00;">Wrangler 4.102</a> that lets an AI agent ship a working Cloudflare Worker without first creating a Cloudflare account. The agent runs <code>wrangler deploy --temporary</code> and gets back a live Worker URL plus a claim link a human can use to keep the account.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Cloudflare provisions a fresh preview account on the fly and returns credentials plus a 60-minute claim URL. If nobody claims the account in 60 minutes, Cloudflare deletes it along with every Worker and resource binding it produced.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Most AI agent runs that build software get blocked at the deploy step because the target platform demands a browser-based signup. Temporary accounts unblock the loop: an agent can ship a working Worker, verify the output itself, and hand a live URL to a human who decides later whether to keep it.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Developers building autonomous coding agents that target <a href="https://developers.cloudflare.com/workers/platform/claim-deployments/" style="color: #f7ff00;">Cloudflare Workers</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">Cloudflare</td>
<td align="right" style="padding-top: 16px;"><a href="https://blog.cloudflare.com/temporary-accounts/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: John Jumper to Anthropic -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://techstartups.com/wp-content/uploads/2026/06/Nobel-winner.jpg" alt="John Jumper headshot — Nobel-winning AlphaFold co-creator departing Google DeepMind for Anthropic" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-19</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">John Jumper to Anthropic — Nobel laureate AlphaFold creator leaves DeepMind</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Nobel chemistry laureate and AlphaFold co-creator John Jumper is leaving Google DeepMind after nine years to join Anthropic.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
John Jumper announced on X that he is leaving <a href="https://deepmind.google/" style="color: #f7ff00;">Google DeepMind</a>, where he has been a VP and Engineering Fellow for nearly nine years, to join <a href="https://anthropic.com/" style="color: #f7ff00;">Anthropic</a>. Jumper shared the 2024 Nobel Prize in Chemistry with Demis Hassabis for AlphaFold, the deep-learning system that predicted the structure of over 200 million proteins.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Anthropic has not disclosed Jumper's title or focus area; he said on X he will take a break before starting. Google DeepMind told reporters he will stay through the end of 2026 to help hand off ongoing work.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Two of Google's most senior AI researchers have left for direct rivals in three days: Noam Shazeer to OpenAI on June 17, and now John Jumper to Anthropic — stripping DeepMind of the public face of its Nobel-winning science-AI program and pulling that credibility toward Anthropic.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Researchers and labs tracking where Nobel-tier AI leaders are moving next.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">Anthropic</td>
<td align="right" style="padding-top: 16px;"><a href="https://www.cnbc.com/2026/06/19/john-jumper-to-leave-google-deepmind-for-anthropic.html" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Cursor 3.8 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/opengraph-changelog-06-18-26.png" alt="Cursor 3.8 changelog cover graphic for the Improvements to Cursor Automations release" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
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

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Cursor 3.8 — /automate skill plus new GitHub and Slack automation triggers</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Describe a task in plain English and Cursor 3.8 turns it into an automation that runs itself when a GitHub event or a Slack emoji fires.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://cursor.com/changelog/06-18-26" style="color: #f7ff00;">Cursor 3.8</a> adds Cursor Automations: saved agent workflows that fire on their own when an outside event happens. You build one with the new <code>/automate</code> skill — describe the job in plain language and Cursor writes the trigger, instructions, and tool list for you.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
When a trigger fires, the automation hands the job to a cloud agent that works from the instructions you captured at setup. Those cloud agents now have the computer-use tool on by default, letting them drive a browser and hand back screenshots as proof of work.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
A Cursor agent used to wait for you to prompt it; an Automation starts from a teammate's signal instead — a review comment, a green CI run, a Slack emoji — so the work begins the moment it is needed rather than when someone remembers to ask.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Teams running cloud-based coding agents on top of <a href="https://github.com/" style="color: #f7ff00;">GitHub</a> and <a href="https://slack.com/" style="color: #f7ff00;">Slack</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">Cursor</td>
<td align="right" style="padding-top: 16px;"><a href="https://cursor.com/changelog/06-18-26" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Noam Shazeer to OpenAI -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://s.yimg.com/os/en/reuters.com/850d1284302b078ebfb99a0ba49133a1" alt="Noam Shazeer headshot — Gemini co-lead departing Google for OpenAI" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-17</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Noam Shazeer to OpenAI — Gemini co-lead becomes Lead for Architecture Research</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Noam Shazeer, co-author of 'Attention Is All You Need' and Gemini co-lead, is moving from Google to OpenAI to head architecture research.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Noam Shazeer — a lead author of the 2017 Transformer paper, founder of <a href="https://character.ai/" style="color: #f7ff00;">Character.AI</a>, and since 2024 a VP and co-lead of Google's <a href="https://gemini.google.com/" style="color: #f7ff00;">Gemini</a> models — announced on June 17, 2026 that he is leaving Google to join <a href="https://openai.com/" style="color: #f7ff00;">OpenAI</a>.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
OpenAI CRO Mark Chen confirmed Shazeer's title as "Lead for Architecture Research," where he will oversee the fundamental design of OpenAI's next-generation models. Google had paid roughly $2.7B to bring him back from Character.AI in 2024.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Shazeer's architectural choices — Transformer, mixture-of-experts, multi-query attention — have shaped frontier models for a decade. Moving him from Gemini to OpenAI shifts one of the few people who can redesign a flagship model architecture, ahead of OpenAI's expected IPO.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Anyone tracking who shapes the next generation of frontier models.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">OpenAI</td>
<td align="right" style="padding-top: 16px;"><a href="https://finance.yahoo.com/technology/ai/articles/googles-gemini-co-lead-noam-002548928.html" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Grok on Databricks -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://x.ai/images/news/grok-databricks.webp" alt="xAI announcement card for Grok models on Databricks Agent Bricks" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
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

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Grok on Databricks — xAI models land in Agent Bricks via SpaceX deal</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">xAI's Grok 4.3 and Grok Build 0.1 are now native model options inside Databricks' Agent Bricks platform.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://x.ai/news/grok-databricks" style="color: #f7ff00;">Grok on Databricks</a> adds two xAI models — Grok 4.3 reasoning (1M-token context) and Grok Build 0.1 coding — as native options inside <a href="https://www.databricks.com/blog/agent-bricks-dais-2026" style="color: #f7ff00;">Databricks Agent Bricks</a>, announced at the 2026 Data + AI Summit.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Inside Agent Bricks, Grok models read context directly from Databricks' Lakehouse rather than an external retrieval service, so structured tables and unstructured documents stay in the customer's governed environment — no outside pipeline needed.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
This is the first time xAI's frontier models are a one-click choice alongside OpenAI, Anthropic, and Google in a governed enterprise data platform — letting regulated organisations try Grok 4.3's 1M-token context against their own Lakehouse tables without routing sensitive data outside.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Enterprise engineering teams already building on <a href="https://www.databricks.com/" style="color: #f7ff00;">Databricks Agent Bricks</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">xAI</td>
<td align="right" style="padding-top: 16px;"><a href="https://x.ai/news/grok-databricks" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Moebius -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2606.19195/gradient.png" alt="Hugging Face paper thumbnail for Moebius image inpainting framework" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-18</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Moebius — 0.22B image inpainting matches FLUX.1-Fill-Dev's 11.9B</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">A 226M-parameter inpainting model that keeps up with 11.9B systems and runs 15× faster.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://arxiv.org/abs/2606.19195" style="color: #f7ff00;">Moebius</a> is a lightweight image inpainting framework from HUST and VIVO AI Lab. At 0.22B parameters — under 2% the size of <a href="https://huggingface.co/black-forest-labs/FLUX.1-Fill-dev" style="color: #f7ff00;">FLUX.1-Fill-Dev (11.9B)</a> — it matches or beats it across six benchmarks on Places2, CelebA-HQ, and FFHQ.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Moebius introduces a Local-lambda Mix Interaction block to fight representation bottleneck under extreme compression, paired with adaptive multi-granularity distillation transferring knowledge from a 10B-class teacher. Per-step inference runs in 26 ms.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Teams that couldn't afford to deploy FLUX.1-Fill-Dev now have an Apache-2.0 model 50× smaller that runs on commodity GPUs. The 15× speedup opens up interactive editing flows where each user click triggers a new inpaint.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
ML researchers building image editing tools, product teams adding inpainting to apps, and students studying <a href="https://github.com/hustvl/Moebius" style="color: #f7ff00;">model distillation</a>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">HUST + VIVO AI Lab</td>
<td align="right" style="padding-top: 16px;"><a href="https://arxiv.org/abs/2606.19195" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: agent-eval -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://huggingface.co/blog/assets/is-it-agentic-enough/thumbnail.png" alt="agent-eval harness thumbnail from Hugging Face" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">BENCHMARK</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">NOTABLE</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-18</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">agent-eval — Hugging Face harness benchmarks coding agents on your own library</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Hugging Face's agent-eval scores libraries on whether agents can actually use them, not just whether they succeed.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
<a href="https://github.com/huggingface/is-it-agentic-enough" style="color: #f7ff00;">agent-eval</a> is an open evaluation harness from <a href="https://huggingface.co/" style="color: #f7ff00;">Hugging Face</a> for testing how well open coding agents work with a specific library. The post argues "if it isn't tested, then it doesn't work" should apply to agent usability, not just human usability.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
agent-eval runs each candidate model against the target library at three access tiers: bare (raw API), clone (library copied into context), and skill (a curated skill bundle) — recording token consumption, wall-clock time, and error rates for each run.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Library maintainers can finally answer "is our API agent-friendly?" with numbers. agent-eval surfaces where docs are missing or APIs are too clever for agents to invoke — the bottleneck for getting Claude Code, Cursor, and other agents to reliably use a stack.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Library maintainers, agent toolers, and ML engineers benchmarking small open models like Kimi-K2.6, GLM-5.1, and Qwen3.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0; padding-top: 16px;">Hugging Face</td>
<td align="right" style="padding-top: 16px;"><a href="https://huggingface.co/blog/is-it-agentic-enough" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
