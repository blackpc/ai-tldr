<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 16px 8px;">

<table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- CARD: DiffusionGemma -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Diffusion_Gemma_Social.width-1300.png" alt="Google DiffusionGemma announcement card with the model name and diffusion-style canvas artwork" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Google Ships DiffusionGemma — 26B Open-Weight Model That Generates 1,000+ Tokens/Sec via Block Diffusion</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Google opens a 26B-parameter Gemma that denoises 256 tokens at once instead of generating them one by one — the first block-diffusion LLM at frontier scale under Apache-2.0.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
DiffusionGemma is a new 25.2B open-weight model from Google DeepMind shipping under Apache-2.0 on Hugging Face. Instead of generating one token at a time, it fills in 256-token canvases by iteratively denoising them — the first block-diffusion model at this scale with competitive benchmark scores.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Generation runs as discrete diffusion: the model starts from a noised 256-token canvas, denoises it in multiple passes, appends the finished block to the KV cache, then starts the next block. That parallel processing yields 1,000+ tokens/sec on an H100 and 700+ on an RTX 5090, landing at just 18 GB VRAM once quantized. It ships with MoE routing (3.8B active parameters per step), Transformers/vLLM/SGLang support, and a companion Jax toolbox with the training and sampling primitives.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Block diffusion is one of the few credible attacks on autoregressive throughput at frontier scale. With 77.6% MMLU Pro, 73.2% GPQA Diamond, and 69.1% LiveCodeBench v6, DiffusionGemma posts competitive accuracy while sustaining four-figure tokens/sec on a single GPU. Apache-2.0 weights let anyone study diffusion-style LLM decoding instead of reverse-engineering closed APIs.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Inference-platform builders and agent authors chasing throughput, ML researchers studying non-autoregressive LLMs, and any team that wants frontier-scale local inference within consumer GPU memory.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Google DeepMind</td>
<td align="right"><a href="https://blog.google/innovation-and-ai/technology/developers-tools/diffusion-gemma-faster-text-generation/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Dario Amodei Policy Essay -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://cdn.prod.website-files.com/67ecbba31246a69e485fdd4b/6a29ae1af3fb3241e2c68979_og_policy-on-the-ai-exponential.jpg" alt="Cover graphic for Dario Amodei's 'Policy on the AI Exponential' essay" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ARTICLE</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Dario Amodei Calls for Mandatory Third-Party AI Testing — With Government Authority to Block Frontier Model Launches</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Amodei turns his AI-is-accelerating thesis into five concrete policy asks, including a government kill switch on frontier model deployments and wage insurance for displaced workers.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
A long-form policy essay published June 10 on Amodei's personal site — the strongest call yet from a top-lab CEO for binding AI regulation. Bloomberg and Axios both led their AI coverage with his demand that the US government gain legal authority to block unsafe frontier model releases.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The essay covers five policy areas: (1) mandatory third-party testing for cyber, bio, and loss-of-control risks with a government deployment veto; (2) wage insurance and retraining funds for AI-displaced workers; (3) FDA/EMA reforms accepting AI modeling as drug-approval evidence; (4) accountability rules banning fully autonomous weapons domestically; (5) a democratic semiconductor coalition that shares supply-chain access while denying it to autocracies.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Frontier labs have spent two years lobbying for voluntary commitments — Amodei is now telling Congress to legislate hard powers. Published the day after Fable 5 launched, the timing is deliberate: he is proposing the exact rules he wants enforced on his own next release, pre-empting regulators from writing something worse.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI-policy watchers, regulators, frontier-lab leadership, and US economic and trade officials shaping the next round of AI governance bills.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Dario Amodei</td>
<td align="right"><a href="https://darioamodei.com/post/policy-on-the-ai-exponential" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Fable 5 Cyber Guardrails Backlash -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://techcrunch.com/wp-content/uploads/2026/06/anthropic-claude-fable.jpg?resize=1200,798" alt="Claude Fable 5 product mark on a dark Anthropic background" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Security Researchers Blast Fable 5's Overbroad Cyber Guardrails — Say Classifier Punts Code Reviews to Older Opus 4.8</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Day-two backlash against Claude Fable 5: the cyber/bio classifier is so broad it silently reroutes routine code reviews and security blog reads to the older Claude Opus 4.8.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Named cybersecurity professionals — including IBM X-Force's Valentina "Chompie" Palmiotti and Tolmo founder Matt Suiche — are publicly criticizing a safety classifier in Claude Fable 5 that swaps in Opus 4.8 for anything it suspects involves cyber or bio topics. Anthropic says the fallback fires on under 5% of sessions, but practitioners say it triggers on tasks as routine as writing secure code.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
A separate keyword-pattern classifier sits outside the model and intercepts each request. If it matches cyber or bio signals it substitutes Opus 4.8, silently, with no user-visible indication. The only escape is Anthropic's Cyber Verification Program — a free but vetted application that takes roughly two business days and is not available to Zero Data Retention customers.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Fable 5's most demanding users — the offensive and defensive security professionals Anthropic is courting via Project Glasswing — say they cannot do their jobs on the public model out of the box. If the classifier stays this strict, vetted competitors get a direct opening, and Anthropic's dual-use research narrative takes a hit one day after launch.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Red teamers, security researchers, AppSec engineers, and anyone following Anthropic's dual-use policy decisions.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Anthropic</td>
<td align="right"><a href="https://techcrunch.com/2026/06/10/cybersecurity-researchers-arent-happy-about-the-guardrails-on-anthropics-fable/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Apple Siri EU DMA -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://images.macrumors.com/t/AMzlHXYCh5f7HOPQwqP7K3rUyXI=/1600x/article-new/2026/06/Siri-AI.jpg" alt="Apple Siri AI marketing badge against a dark gradient" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">ECOSYSTEM</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-09</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">EU Rejects Apple's DMA Exemption — 450M+ EU Users Won't Get Siri AI on iOS 27 or iPadOS 27</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Apple and Brussels openly trade blame over why Siri AI is shipping everywhere except the EU — the first time the DMA has visibly held back a flagship AI launch on iPhone.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Apple posted a newsroom note the day after WWDC saying it cannot ship Siri AI in the EU on iOS 27, iPadOS 27, or watchOS 27 due to Digital Markets Act constraints. European Commission spokesperson Thomas Regnier publicly rejected that framing, telling reporters the decision is "Apple's and Apple's only" and that nothing in the DMA prohibits Apple from launching in the EU.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Apple proposed a "Trusted System Agent" intermediary that would phase in third-party assistant access over 18 months, arguing unrestricted DMA compliance would give any AI system unlimited access to EU users' messages, files, and cross-app actions. Brussels classified Apple's proposal as a request for blanket interoperability relief — not a compliance plan — and rejected it. macOS 27 and visionOS 27 still get Siri AI in the EU because they fall outside the DMA gatekeeper scope.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
It sets a public template for how Brussels handles "we can't comply safely" arguments from big-AI vendors — every other assistant builder is watching before scoping their own EU rollouts. Roughly 450 million EU iPhone and iPad users now wait indefinitely while the Trusted System Agent fight plays out in negotiations.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
iOS developers, EU policy teams, and AI product leads shipping in regulated markets who need to scope their own DMA compliance.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Apple</td>
<td align="right"><a href="https://www.macrumors.com/2026/06/09/eu-says-decision-not-to-launch-siri-ai-in-europe-is-apples/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Google AI Plus Price Cut -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://techcrunch.com/wp-content/uploads/2026/01/ai-mode-google.jpg?resize=1200,800" alt="TechCrunch hero image of Google's Gemini AI Mode illustrating the Google AI Plus price cut announcement" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">TOOL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-08</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Google Cuts AI Plus to $4.99/Month and Doubles Storage — First Major US Consumer AI Price Cut</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Google chops 37% off its mid-tier AI subscription and doubles storage to 400GB — firing the opening shot in a US consumer AI-plan price war.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Google AI Plus — the cheapest of Google's three paid Gemini subscriptions — dropped from $7.99 to $4.99/month and included Google One storage doubled from 200 GB to 400 GB. It's the first mid-tier US consumer AI-subscription price cut, announced by Gemini-subs lead Vikas Kansal on June 8.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Existing subscribers keep the same plan; the new price kicks in at the next billing cycle, and the storage bump rolls out gradually over several days. All existing perks stay intact: 2× free-tier Gemini usage limits, Gemini 3.1 Pro access, Omni Flash video generation, the new Daily Brief agent, NotebookLM, and Gmail AI Inbox in the US.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Consumer AI plans in the West are starting to commoditize the way they already did in India, putting direct pressure on $20 ChatGPT Plus and $20 Claude Pro. It signals where AI Pro and Ultra pricing may eventually land — and it's the first domino to tip since all three major US labs launched premium tiers at $20.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Individual Gemini users, students, and anyone currently on the free tier or weighing AI subscription options.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Google</td>
<td align="right"><a href="https://techcrunch.com/2026/06/09/google-just-fired-a-warning-shot-in-the-ai-subscription-price-wars/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: Amap ABot-Earth 0.5 -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://opengraph.githubassets.com/1/amap-cvlab/ABot-Earth-0.5" alt="GitHub social card for the amap-cvlab/ABot-Earth-0.5 repository" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MODEL</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-08</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Alibaba's Amap Open-Sources ABot-Earth 0.5 — Generates Kilometer-Scale 3D City Scenes From a Satellite Image in 10 Minutes</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">Alibaba's Amap turns one satellite image into an interactive 3D Gaussian Splatting city at roughly 10 min/km² on a consumer GPU — claiming a 1,000× speed-up over traditional pipelines.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
ABot-Earth 0.5 is a generative 3D world model from Amap's CV Lab that synthesizes seamless urban scenes from geospatially-referenced satellite imagery or a text prompt, outputting 3D Gaussian Splatting scenes compatible with Unity, Unreal, and a web viewer. Code, a tech report, and the ABot-Earth Studio beta are all live now.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
Unlike NeRF pipelines that optimize per scene, the model is trained directly on 3D data so it generates rather than reconstructs. A hierarchical level-of-detail structure streams large areas to a web mapping platform, and end-to-end generation runs on a single consumer GPU at roughly 10 min/km². Amap already uses it to train the Amap Tutu autonomous quadruped robot, cutting virtual-environment construction from days to minutes.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Amap claims a 1,000× speed-up at roughly 1% of the cost of traditional scene-building pipelines. The Tutu robot proof point shows 3DGS world models are graduating from research demos into actual training-data tooling for embodied AI — not just rendering experiments.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
Robotics, autonomous-driving, AR/VR, and game teams that need photoreal city-scale simulation environments without expensive traditional reconstruction pipelines.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">Amap (Alibaba)</td>
<td align="right"><a href="https://github.com/amap-cvlab/ABot-Earth-0.5" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>

<!-- CARD: xAI Grok Safety Lawsuit -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<tr>
<td>
<img src="https://techcrunch.com/wp-content/uploads/2026/03/grok-getty.jpg?resize=1200,800" alt="TechCrunch hero image used for its coverage of the Devin Kim wrongful-termination suit against xAI" width="100%" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 16px;">

<div style="margin-bottom: 12px; line-height: 1.5;">
<span style="display: inline-block; background-color: #181818; color: #f5f5f0; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">SECURITY</span>
<span style="display: inline-block; width: 6px;">&nbsp;</span>
<span style="display: inline-block; background-color: #f7ff00; color: #050505; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: Menlo, Consolas, monospace; vertical-align: middle;">MAJOR</span>
<span style="display: inline-block; padding-left: 12px; font-size: 13px; color: #8a8a85; vertical-align: middle;">2026-06-10</span>
</div>

<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">Ex-xAI Engineer Sues xAI and SpaceX Over Grok Safety Termination — Alleges Co-Founder Said "AI Will Kill Us All Anyway"</h2>

<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">First major US wrongful-termination suit against a frontier AI lab to put internal safety practices on the record — and it lands days before SpaceX's planned IPO.</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
Early xAI hire Devin Kim — now head of the Center for AI Safety — filed a wrongful-termination and retaliation suit in California state court on June 10, naming xAI and SpaceX as defendants. He alleges he was fired in September after pushing for Grok safety guardrails, just before a scheduled internal safety presentation.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
The complaint alleges Kim repeatedly raised that xAI's failure to prioritize safety risked facilitating discrimination and WMD proliferation through Grok. It names co-founder Jimmy Ba as the supervisor who rejected safety mechanisms, allegedly stated "AI will kill us all anyway," tried to undercut EU rules during the Grok Code 1 release, and fired Kim just before his internal safety briefing. The suit seeks compensatory and punitive damages plus a declaratory judgment of unlawful conduct.
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
Discovery will put xAI's internal safety governance on the public record while SpaceX underwriters are still pricing the IPO book. It will be cited in any future legislative hearing about whether voluntary AI safety commitments at frontier labs are meaningful.
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
AI safety researchers, policy staff, journalists covering xAI and SpaceX, and anyone tracking governance norms at frontier AI labs.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">xAI</td>
<td align="right"><a href="https://techcrunch.com/2026/06/10/xai-fired-an-engineer-who-raised-alarms-about-grok-safety-new-lawsuit-claims/" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: Menlo, Consolas, monospace;">DETAILS →</a></td>
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
