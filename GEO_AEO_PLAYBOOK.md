# AI/TLDR — GEO & AEO Playbook (SEO for the AI era)

**What this is.** GEO (Generative Engine Optimization) and AEO (Answer Engine
Optimization) are the discipline of getting **cited and quoted inside AI
answers** — ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot, Claude —
instead of merely ranking on a page of blue links. This file is the single
source of truth for AI-era search on this repo. It is the companion to
[SEO.md](SEO.md) (classic SEO: titles, sitemaps, rich results). When the two
overlap, **this file governs the AI surfaces and SEO.md governs Google's
classic SERP.**

**Created**: 2026-06-15 · **Domain**: https://ai-tldr.dev · Cloudflare Worker
([src/worker.ts](src/worker.ts)), static prerender ([scripts/prerender.ts](scripts/prerender.ts) +
[scripts/prerender-learn.tsx](scripts/prerender-learn.tsx)).

Every statistic below carries a dated, verifiable source. Numbers in this space
move fast — **re-verify anything older than ~6 months before quoting it.**

---

## 0. TL;DR — the 12 rules that matter most

If you read nothing else, do these. They are ordered by leverage for *this*
site. Each maps to a section below.

1. **Stay prerendered. Never ship an empty `#root`.** AI crawlers do **not run
   JavaScript** (Vercel, ~1.3B fetches: zero JS execution). A client-only SPA is
   invisible to ChatGPT, Claude, and Perplexity. Our prerender is our single
   biggest GEO asset — guard it. (§3, §5)
2. **Get indexed in *both* Bing and Google.** ChatGPT Search + Copilot retrieve
   from **Bing**; AI Overviews + Gemini from **Google**. A page Bing hasn't
   crawled cannot be cited by ChatGPT, no matter its Google rank. Submit to
   **Bing Webmaster Tools**, not just Search Console. (§2, §5)
3. **Answer first (BLUF).** Lead every section with the direct answer in the
   first 1–2 sentences. ~55% of AI-Overview citations come from the top 30% of a
   page; engines score passages, not whole pages. (§4)
4. **Statistics + named quotes + citations.** The three highest-lift content
   edits in the peer-reviewed GEO study: Quotation **+41%**, Statistics **+33%**,
   Cite Sources **+28%**. We already verify every claim — lean into it. (§4)
5. **Question-shaped headings + self-contained answer capsules** (40–60 words,
   no inline links) under each H2/H3. (§4)
6. **Keep it fresh, and *show* the date.** ChatGPT cites pages updated in the
   last 30 days ~3× more; AI-cited content is ~25.7% fresher than top organic.
   Our 8h/2h sweeps are a structural edge — surface a visible "Updated" date. (§4)
7. **Allow every AI crawler.** Our `robots.txt` is `User-agent: * / Allow: /` —
   correct. Blocking search/user bots (OAI-SearchBot, PerplexityBot,
   ChatGPT-User) silently deletes us from AI answers. Never add training-bot
   blocks. (§3)
8. **Build the brand entity.** Add an `Organization` `sameAs` array (X, GitHub,
   LinkedIn, Wikidata) so engines resolve "AI/TLDR" to one knowledge-graph node
   instead of hallucinating. Create a **Wikidata** item (no notability bar). (§6)
9. **Become a primary source.** Publish an original, recurring **AI
   release-velocity / landscape stats page** from the feed we already own. A
   unique number forces attribution — the strongest citation magnet there is. (§6)
10. **Comparison tables on `/learn/landscape`.** Tables get ~2.5× the citations
    of prose for "best/vs" queries, and we already have the verified data
    (stars, license, language). (§4, §5)
11. **Measure the right thing.** Referral sessions undercount AI influence ~2–3×
    (zero-click). Track **citation share** from a *frozen* prompt set, not GA4
    sessions. Set up the GA4 AI-traffic channel anyway — it has no backfill. (§7)
12. **Don't keyword-stuff or fabricate.** Stuffing measured **−8.2%** in the GEO
    study; fabricated stats/quotes fail the corroboration gate *and* violate our
    zero-hallucination policy. The honest play *is* the optimal play here. (§8)

---

## 1. What GEO & AEO actually are

### 1.1 Definitions

- **GEO — Generative Engine Optimization.** The academic term, coined in the
  paper *"GEO: Generative Engine Optimization"* by Pranjal Aggarwal et al.
  (Princeton, Georgia Tech, Allen Institute for AI, IIT Delhi), arXiv
  **2311.09735** (Nov 2023), published at **ACM SIGKDD KDD 2024**. It is the
  first peer-reviewed formalization of the field. Goal: maximize a source's
  **visibility inside an AI-generated answer.**
- **AEO — Answer Engine Optimization.** The practitioner sibling term. Same
  destination (be the cited answer) with a broader framing that also covers
  featured snippets and voice assistants. Organized around question-intent
  ("what is…", "how to…").
- **LLMO / LLM SEO / AIO / "AI Search Optimization"** — near-synonyms. As of
  early 2026 there is **no settled academic distinction**; Wikipedia notes they
  are "frequently used interchangeably," and Google's official line is that
  optimizing for generative AI search is "still just SEO."

> **Rule:** treat GEO / AEO / LLMO / AIO as overlapping, not rigorously
> distinct. Cite the origin precisely (Aggarwal et al., arXiv 2311.09735, KDD
> 2024) — never attribute it to a vendor blog.

### 1.2 How it differs from classic SEO

| | Classic SEO | GEO / AEO |
|---|---|---|
| **Unit of success** | Page **rank** on a 10-link SERP | Being **cited / quoted / synthesized** in one answer |
| **Metric** | Keyword position, CTR | **Share of voice**, citation frequency, presence rate |
| **Surface** | The SERP | A single generated answer — often **no SERP, no list** |
| **Outcome** | Click to your site | Often **zero-click** (answer resolved in-line) |
| **What's read** | Whole page, links | **Passage-level chunks**, semantic retrieval |
| **Levers that backfire** | — | **Keyword stuffing (−8.2%)**, padding word count (~0%) |

### 1.3 The 2025–2026 answer-engine landscape

Web-visit share among the major assistants (date every figure — these move fast):

- **ChatGPT** — dominant but eroding: ~76.5% (Feb 2025) → ~54.7% (Apr 2026).
- **Gemini** — surging: ~5.6% → ~27.4% in the same window (~+104% in six months).
- **ChatGPT + Gemini ≈ 80%+** of generative-AI web traffic combined.
- **Long tail:** DeepSeek ~4%, Grok ~2.8% (has overtaken Perplexity by some
  measures), Perplexity ~1.5% global (but ~15–20% of US AI *search* traffic),
  Copilot ~1.1%, Claude the remainder.

**Citation behavior differs per engine — and overlap is tiny:**

- **Perplexity** — always cites (live retrieval is the product).
- **ChatGPT** — cites only when browsing/search is active; since Jun 2025
  appends `utm_source=chatgpt.com` to outbound links (use this to measure).
- **Google AI Overviews / AI Mode** — show a source panel; inline numbered
  citations not guaranteed.
- **Gemini** — most like classic search, strict sourcing; ~52% of citations are
  brand-owned domains.
- **Claude** — cites on request / when given source material.
- **Overlap:** only **~11%** of domains are cited by *both* ChatGPT and
  Perplexity; AI Overviews vs AI Mode cite the same URL only **~13.7%** of the
  time. → "Optimize once, win everywhere" is **false.** Optimize per engine.

### 1.4 Why it matters now

Two numbers moving in opposite directions (state both, or you'll mislead):

- **Zero-click is accelerating.** ~**68%** of US Google searches ended without a
  click in Jan–Apr 2026 (SparkToro/Similarweb), up from 60.45% in 2024. AI
  Overviews appear on 20%+ of searches and cut organic CTR ~60% YoY; position-1
  CTR on AIO keywords fell 7.3% → 2.6% (Mar 2024 → Mar 2025).
- **AI referrals are growing fast off a small base.** +357% YoY to ~1.13B visits
  (Adobe, Jun 2025) — but still only **~1–1.5%** of total web traffic (Conductor,
  Jan 2026: 1.08%). Projections: 5–10% within two years; AI may pass social as a
  traffic source by ~2028.

**Takeaway for ai-tldr:** AI search is a *fast-growing but still small* channel.
Invest proportionally — but the cost for us is near-zero because our
architecture and editorial rules already align with what GEO rewards. The
upside is being the source an AI names when someone asks "what AI shipped this
week."

---

## 2. How AI answer engines retrieve & cite (the mechanics)

You cannot optimize what you don't understand. Every major engine answers via a
**live Retrieval-Augmented Generation (RAG)** pipeline — it writes the answer
from passages placed in its context window, **not from memory.**

```
query → (fan-out into sub-queries) → live retrieval from a search index
      → rerank (relevance, freshness, structure, authority, corroboration)
      → ground the model on a handful of passages → synthesize with citations
```

### 2.1 The seven facts that drive everything

1. **It's live retrieval, not training recall.** Perplexity runs a six-stage
   pipeline (intent → embedding index → multi-method retrieval → L1–L3 ML
   ranking → prompt assembly → constrained synthesis). The LLM "synthesizes from
   pre-selected evidence rather than generating from memory alone." **To be
   cited, you must first be retrieved.**
2. **The underlying index decides who's eligible.** ChatGPT Search + Copilot →
   **Bing**. AI Overviews + Gemini grounding → **Google**. Perplexity → its own
   crawl + third-party indexes (served via Vespa). *If Bing hasn't indexed you,
   ChatGPT literally cannot retrieve you.*
3. **Retrieval is chunk-level and semantic.** Engines embed and retrieve
   **passages**, not pages. A chunk "cut off mid-paragraph" gives incomplete
   context and gets dropped. Perplexity: "90% of top-cited sources answered the
   core question within the first 100 words." → **self-contained passages win.**
4. **Reranking is a multi-gate gauntlet:** semantic relevance → **freshness**
   (~70% of top Perplexity citations updated within 12–18 months; time-sensitive
   content decays in 2–3 days) → structure → **authority** (E-E-A-T acts as a
   binary pass/fail gate; 96% of AIO citations have strong E-E-A-T) →
   corroboration → engagement.
5. **Citation goes to the most specific, attributable, corroborated passage.**
   Winners share three traits: **specificity** (bounded claims with stats),
   **corroboration** (agreement across reputable sources), **provenance** (named
   author, publisher, date). Stat-bearing, source-citing, direct-answer content
   is cited **3–5× more often.**
6. **Classic rank is still the dominant feeder — but fan-out changed the math.**
   94% of AI Overviews cite ≥1 of the top-20 organic results; ~90% the top-10.
   *But* direct top-10→AIO overlap fell **76% → 38%** in 2025 because Google's
   query fan-out cites pages that perform across a **cluster** of sub-queries. A
   page ranking 21–100 can be cited; a #1 page can be skipped. You almost never
   get cited if you're absent from organic results entirely.
7. **Training-data presence is a separate, weaker lever.** Being in Common Crawl
   / C4 / RefinedWeb builds "parametric memory" of your brand — it raises recall
   and trust, but **does not replace being retrievable live.** Broad web mentions
   of your entity help; they don't substitute for being in the index.

> **Surprising but load-bearing:** topical authority beats raw domain size.
> 92.78% of Perplexity-cited pages had **fewer than 10 referring domains**;
> schema markup correlated with a **47% vs 28%** top-3 citation rate; AIO rewards
> **entity density** (~15+ knowledge-graph entities per 1,000 words). Wikipedia
> is ChatGPT's single most-cited source (7.8% of all citations) precisely
> because it is structured, dense, neutral, dated, and heavily sourced — **the
> template for citeable content.**

---

## 3. Technical & structured-data rules

This is where ai-tldr already has its strongest moat. The wins are concrete and
verifiable.

### 3.1 The #1 technical fact: AI crawlers don't run JavaScript

Vercel's analysis of ~1.3B fetches (GPTBot, Claude, AppleBot, PerplexityBot)
found **none** of the major AI crawlers execute JS. They send one HTTP request,
parse the raw HTML, and move on — no headless browser, no retry. GPTBot's fetch
mix: 57.7% HTML, 11.5% JS, **34.8% 404s**. Only **Googlebot** (and
Google-Extended, which inherits its pipeline) renders JS.

> **Rule:** prerender/SSR every indexable route into static HTML with full
> visible body text. The only valid AI-visibility test is `curl` (no JS) — if the
> body text and JSON-LD aren't in the raw response, the page does not exist to
> ChatGPT/Claude/Perplexity. **"It works in my browser" proves nothing** — the
> browser runs JS; the bot doesn't.

✅ **ai-tldr already does this** — [scripts/prerender.ts](scripts/prerender.ts)
fills every release/home/influencers/log `#root` with crawlable HTML, and
[scripts/prerender-learn.tsx](scripts/prerender-learn.tsx) does the same for
Learn. Any refactor that reverts a page to an empty `#root` makes it invisible to
AI. This is the load-bearing invariant.

### 3.2 schema.org JSON-LD — each type is an extraction handle

Must be in the **static `<head>`** (non-JS bots never see client-injected
schema; React streaming can also defer it — see Next.js issue #87723). Match
type to content:

| Type | Job |
|---|---|
| `NewsArticle` / `TechArticle` | headline, datePublished, author, publisher for dated releases / papers |
| `FAQPage` | Q→A pairs — ideal for AEO direct-answer extraction |
| `SoftwareApplication` / `SoftwareSourceCode` | tools / repos / models |
| `Dataset` | dataset discovery |
| `Organization` + `WebSite` (`@graph`, joined by `@id`) | one canonical brand entity every page references |
| `BreadcrumbList` | hierarchy |
| `Person` + `sameAs` | influencer entities, disambiguated |
| `ItemList` | the feed, the directory |

✅ **ai-tldr's stack is comprehensive and correctly placed** —
[scripts/prerender.ts](scripts/prerender.ts) emits all of the above into static
HTML, with `WEBSITE_REF`/`ORG_REF` joined by `@id`. This maps cleanly onto what
engines extract. ⚠️ **Gap:** `ORG_REF` has **no `sameAs`** (§6.2).

### 3.3 AI-crawler robots policy — allow everything (we do)

Crawlers split into classes; blocking the wrong one silently kills citations:

- **Training** (block = out of model weights, no visibility effect): GPTBot,
  ClaudeBot, CCBot, Meta-ExternalAgent, Amazonbot, Bytespider.
- **Search/retrieval** (block = **removed from AI answers**): OAI-SearchBot,
  Claude-SearchBot, **PerplexityBot**, Bingbot.
- **User-triggered live fetch** (block = assistant can't pull your page on
  demand): ChatGPT-User, Claude-User, Perplexity-User.
- **Opt-out tokens** (never in logs; govern training reuse only): Google-Extended,
  Applebot-Extended.

✅ **Our `User-agent: * / Allow: /` is exactly right** for a tracker whose
mission is maximum AI visibility. **Never** add training-bot `Disallow`s, and
never fall for the classic footgun — `Disallow: /` with `Allow:` only for
Googlebot, which silently blocks OAI-SearchBot/Claude-SearchBot/PerplexityBot
and deletes you from AI answers while you think you "just blocked scrapers."
(Note: Bytespider and some undeclared Perplexity crawlers ignore robots.txt —
only a WAF stops those; not worth doing for us.)

### 3.4 Foundations that still gate everything

AI bots are single-shot with **no retry**, and 34%+ of their fetches hit 404s —
so a slow first byte, a redirect chain, or an error **is** the answer they
record. Keep: fast TTFB, a 200 on the exact canonical (trailing-slash-consistent)
URL, semantic HTML, fresh sitemaps, OG/Twitter cards. ✅ Our live
Worker-served news sitemap re-filters on the request-time clock so crawlers
always land on 200s — keep that.

### 3.5 llms.txt — ship it, but expect ~0 value (honest verdict)

The `/llms.txt` spec (Jeremy Howard / Answer.AI, Sep 2024, llmstxt.org) is real
and simple: a Markdown file with an H1, an optional summary blockquote, and H2
sections of `[title](url)` links (plus an optional `/llms-full.txt` with content
inlined). **But adoption evidence is damning:** John Mueller (Google, Jun 2025)
and Gary Illyes (Jul 2025) confirmed Google doesn't use it; OpenAI, Anthropic,
and Perplexity never cite it; SE Ranking's Nov 2025 study of 300k domains found
**no measurable citation lift.**

> **Rule:** ship a static `/llms.txt` as a cheap, harmless hedge (one build
> step) — but treat its impact as zero and do **not** hand-curate it heavily.
> It's a checkbox, not a strategy. ⚠️ We don't have one yet (§5 quick win).

---

## 4. On-page content rules (the highest-leverage, lowest-risk work)

These come from the **peer-reviewed GEO study** (Aggarwal et al., KDD 2024,
10K-query GEO-bench) plus practitioner citation studies. They are the rules our
editorial process should bake in.

### 4.1 The GEO-bench results (cite the primary numbers, not rounded blog ones)

Effect on **Position-Adjusted Word Count** / **Subjective Impression**
(arXiv 2311.09735, Table 3):

| Content edit | Pos-Adj Word Count | Subjective Impression |
|---|---|---|
| **Quotation Addition** (named-source quotes) | **+41.0%** | +28.1% |
| **Statistics Addition** (hard numbers) | **+32.8%** | +23.1% |
| **Cite Sources** (outbound citations) | **+27.8%** | +13.7% |
| Fluency Optimization | +28.7% | +13.5% |
| Authoritative tone | +11.7% | +18.7% |
| Technical terms | +18.5% | +11.0% |
| Adding more words | ~0% | ~0% |
| **Keyword Stuffing** | **−8.2%** | +2.6% |

The headline "up to 40%" is this cluster. **Efficacy is domain-specific:** Cite
Sources wins factual/legal topics; Quotations win people/history/explanation;
Statistics win debate/opinion/policy. The authors explicitly conclude
"traditional SEO-based strategies will not be applicable."

### 4.2 Structure rules (how engines actually read)

- **Answer-first / BLUF.** Lead each section with the direct answer in the first
  1–2 sentences, *then* elaborate. ~55% of AI citations come from the top 30% of
  a page; vague openers get skipped for a competitor's.
- **Question-shaped headings.** Write H2/H3 as the literal prompt a user types
  ("What is RAG?", "How does vLLM batch requests?"). They map to the model's
  generated sub-queries.
- **Answer capsules.** Put a **40–60 word self-contained block** immediately
  under each heading, quotable in isolation, **with no inline links inside it**.
  ~72% of ChatGPT-cited content contained such capsules; ~91% of cited capsules
  had no inline links.
- **Definition opener.** Start definitional content with `X is a [category] that
  [key differentiator]` as one verbatim-liftable declarative sentence.
- **Extractable formats win:** lists ≈ 32.5% of all AI citations; tables get
  ~2.5× the citations of prose; passages with **3+ data points** ~2.5×; how-to
  content ~54% on procedural queries; original-data pages sit in ~67% of top
  citations. **Comparison tables especially win "best/vs/choose" queries.**
- **Atomic paragraphs.** One idea, 25–40 words, so a chunk lifts cleanly. Apply
  the **copy-paste test:** if a single paragraph copied alone still fully answers
  its heading's question, it's citation-ready.
- **Freshness, visible.** AI-cited content is ~25.7% fresher than top organic;
  ChatGPT cites last-30-day updates ~3× more; ~50% of Perplexity citations are
  current-year. Show a `Updated: <date>` stamp in the **body**, not just JSON-LD,
  and refresh evergreen pages on a cadence (target < 13 weeks).

### 4.3 How this lands on ai-tldr content

- **/learn encyclopedia** is already a near-ideal GEO substrate — typed blocks
  (`in-plain-english` → `why-it-matters` → `how-it-works`), FAQ (3–7), a crisp
  `oneLiner`. Enforce: the `in-plain-english` opener should lead with the
  `X is a …` definition; FAQ questions should be **prompt-shaped** and each
  answer a 40–60 word capsule. (FAQPage JSON-LD already ships.)
- **/learn/landscape** — add a small **comparison table** (name · what-it-does ·
  stars · license) wherever a subcategory lists competing tools. Highest-leverage,
  lowest-risk add we have: tables are disproportionately cited, and the data is
  already verified and auto-refreshed.
- **Release feed** — ensure each summary leads with the direct
  *what-happened* answer in plain B2 English (matches our readable-English rule)
  so it's liftable as an answer capsule. We already verify every stat/URL — add a
  named-source stat where natural (GitHub stars, benchmark numbers).
- **Anti-cannibalization** (`check-learn.ts`) already forces each article into a
  distinct semantic slot — that *is* GEO specificity. Keep extending it.

> **Zero-hallucination is a GEO asset, not a constraint.** The top-lift edits are
> *verifiable* statistics and *named-source* quotations. Fabricating them fails
> the corroboration/provenance gate, can get a page distrusted, and breaks our
> policy. The honest play is the optimal play.

---

## 5. ai-tldr action plan (mapped to files)

Where we win today, then the prioritized backlog. This supersedes the AI-relevant
items in [SEO.md §8](SEO.md) (which is also stale — it lists 56 release pages; we
have 737+).

### 5.1 What we already do right (don't regress these)

- ✅ Full static prerender of every route → AI-crawler-visible (§3.1).
- ✅ Deep JSON-LD stack in static `<head>`, type-matched per page (§3.2).
- ✅ `robots.txt` allows all AI bots; `max-image-preview:large` + `max-snippet:-1` (§3.3).
- ✅ Live Worker-served news sitemap, request-time-filtered → no stale 404s (§3.4).
- ✅ Visible FAQ section on home backing FAQPage markup.
- ✅ Title ≤60 / description 120–158 discipline; canonical + OG + Twitter.
- ✅ 8h feed + 2h star refresh = genuine freshness velocity (§4.2) — a moat.
- ✅ Zero-hallucination editorial = built-in provenance/corroboration (§4.3).

### 5.2 Quick wins (low effort, high or cheap GEO value)

Ordered by leverage. File anchors from the audit.

> **Status (shipped 2026-06-15):** ✅ #1 `sameAs`, #2 question headings, #3
> `llms.txt`, #6 `author.url`, #9 `/feed.xml`, #10 preconnects — plus the §5.3
> "Related releases" internal-link nav. ⏳ Remaining (UI/feature): #4 visible
> "Updated" stamp on Learn, #5 landscape comparison tables. 👤 User-action
> (can't be done in code): #7 Bing Webmaster Tools submit, #8 GA4 AI-traffic
> channel.

1. **Add `Organization` `sameAs`** to `ORG_REF` in
   [scripts/prerender.ts](scripts/prerender.ts) — point at the brand's X, GitHub,
   LinkedIn, and (once created) Wikidata. Single biggest entity-disambiguation
   lever; de-hallucinates "what is AI/TLDR." *~3 lines.* (§6.2)
2. **Question-shape release headings.** ✅ `renderReleaseBody`
   ([scripts/prerender.ts](scripts/prerender.ts)) now emits "What is it?",
   "How does it work?", "Why does it matter?", "Who is it for?". The
   entity-name form ("What is {name}?") was tried and dropped — release titles
   are headlines, not clean product names, so it read awkwardly; a dedicated
   short-name field in the schema would unlock it later. Learn H3s still
   pending. (§4.2)
3. **Ship `/llms.txt`** (and `/llms-full.txt`) — emit from prerender `main()`:
   H1 `AI/TLDR`, a blockquote, H2 link lists for `/`, `/learn/`, `/influencers`,
   `/log`, and top releases. Cheap hedge; expect ~0 lift today. (§3.5)
4. **Visible "Updated" stamp** on Learn + landscape pages (stars already refresh
   in the 2h sweep) — expose the refresh date in the body, not just `dateModified`.
   Freshness is worth ~3× on ChatGPT. (§4.2)
5. **Comparison tables on `/learn/landscape`** subcategory pages from existing
   verified data (name · what-it-does · stars · license). (§4.3)
6. **`author.url` on release `NewsArticle`** — map org → homepage (Anthropic →
   anthropic.com) in `renderJsonLdArticle`. E-E-A-T/provenance. *~3 lines.*
7. **Submit to Bing Webmaster Tools** (not just Search Console) + IndexNow, so
   ChatGPT/Copilot can retrieve us. **User action**, highest strategic ROI of all
   — without it half the engines can't see us. (§2.1)
8. **GA4 AI-traffic channel** (§7.1) — no backfill, so set it up now even before
   anything else.
9. **`/feed.xml` (Atom)** — long-flagged in SEO.md; ideal for a release tracker
   and a clean machine-readable surface. *~30 min.*
10. **Preconnect to image CDNs + font preload** in the HTML template — protects
    TTFB/LCP, which gates the single-shot crawl. (§3.4)

### 5.3 Bigger bets (real GEO upside)

1. **Original "AI Release Index" stats page.** Turn the feed into a recurring,
   citable dataset: releases per lab per quarter, OSS-tool growth, star deltas
   (already tracked in `refresh-learn-stars.ts`). Present each headline number as
   a one-sentence extractable claim beside a chart. **This is the single strongest
   citation magnet** — a unique number forces attribution, and every figure
   derives from our verified feed (policy-safe). (§6.1)
2. **Create a Wikidata item for AI/TLDR**, then point `Organization.sameAs` at
   it — the controllable bridge to the Google Knowledge Graph (no notability bar,
   unlike Wikipedia). (§6.2)
3. **Related-releases internal-linking rail** (same category / org / tags) on
   release pages — today each release is a crawl dead-end reachable only from home
   or sitemap. Improves crawl depth + co-citation surface.
4. **Answer-first rewrite of release explainers** as question→answer pairs tied to
   the title — unlocks topical-authority + FAQ benefits across 737 pages. Editorial,
   zero-hallucination-validated.
5. **Reverse-engineering loop** (§6.3) — a weekly frozen-prompt audit of who the
   engines cite for our target queries, turned into a per-source acquisition backlog.

---

## 6. Off-page authority & the white-hat "secret" tricks

On-page makes you *eligible*; off-page decides whether engines *trust and quote*
you. The lever is **corroboration** — RAG engines cite entities that appear
consistently across many independent, authoritative sources. These are the
clever-but-legitimate moves. (Black-hat shortcuts are in §8 — they backfire.)

### 6.1 Become the primary source (strongest single magnet)

A unique statistic or benchmark is a fact unavailable elsewhere, so engines
**must** attribute it to you (GEO study: stats alone +33%; multi-source
validation ~+67% citation lift). **For ai-tldr:** ship a recurring original
**AI Release Index** from the feed (see §5.3 #1) with a stable, linkable URL and
a press-ready one-sentence stat per metric. Journalists and listicle authors cite
the number — and every cite is both a backlink *and* an entity-corroborating
mention. Nothing else in this playbook compounds like owning an original dataset.

### 6.2 Build a real knowledge-graph entity

Engines cite entities they can *resolve*. Build the stack:

- **Wikidata item** (no notability requirement → do this today). It feeds the
  Google Knowledge Graph.
- **`Organization` schema with a `sameAs` array** pointing at every owned
  profile (X, GitHub, LinkedIn, Crunchbase, the Wikidata item). The single most
  important schema addition — it tells engines "the entity on this site is the
  same one at those URLs."
- **Identical NAP + description everywhere.** State the brand name and one-line
  description *the same way* across releases, Learn metadata, social bios, and PR.
  Inconsistency splits the entity and weakens corroboration.

The combined stack typically yields a Knowledge Panel in ~3–6 months. **For
ai-tldr:** `/influencers` is also corroboration fuel — it consistently names and
describes real AI entities, so a web-verified directory makes us a source engines
*cross-reference* for "who is X in AI," reinforcing our own authority by
association.

### 6.3 Reverse-engineer the citations (the operating workflow)

The move that ties everything together, weekly:

1. Run your 20–30 target prompts through ChatGPT, Perplexity, Gemini, Claude,
   Google AI Mode (neutral geo, personalization off).
2. Log **every cited URL**. Where competitors appear and you don't is your
   **citation gap**.
3. The fix is **source-specific**: if a Reddit thread, a G2 list, a Wikipedia
   section, or a "best AI tools" listicle is the cited source, earn a place **on
   that exact source** (contribute to the thread, get listed, expand the entity) —
   not just improve your own page.

This converts "be authoritative" into a concrete, source-by-source target list.

### 6.4 Earn corroboration on the surfaces engines actually cite

A few domains dominate AI citations because they're crawlable, structured,
peer-validated, **and licensed for training** (Reddit ~$60M/yr Google + ~$70M/yr
OpenAI deals): **Reddit (~40% of sources), Wikipedia (~26%), YouTube (~23.5%)**,
plus Quora, G2/Capterra, and "best-X / top-X" listicles. White-hat ways in:

- Genuinely helpful, well-upvoted **Reddit/Quora** answers in AI subreddits
  (treated as experience-based peer validation).
- Get **/learn/landscape** and the project into relevant **GitHub awesome-lists /
  directories** that crawlers index — structured, high-crawl-frequency hosts.
- **Digital PR / expert sourcing** via the live HARO successors — **Featured.com**,
  **Qwoted** (bans AI pitch spam), **SourceBottle** — pitching with *our original
  data* as the hook. Each placement is a high-authority, independent corroboration.
- **Own the decision-stage pages**: "best AI release tracker", "X vs Y",
  "alternatives to …" with structured comparison tables — engines synthesize
  these heavily for recommendation queries.

> ⚠️ **Volatility warning:** never bet the strategy on one platform's current
> share — ChatGPT's Reddit citation share collapsed ~60% → ~10% in weeks after a
> retrieval change (Aug→Sep 2025). Diversify and re-audit.

### 6.5 Freshness as off-page leverage

~79% of AI citations are from the last two years; ~50% of Perplexity citations
are current-year. Our 8h/2h cadence is *already* an off-page advantage most
publishers can't match — make it legible with visible "updated" dates and keep
re-verifying stats so the freshness signal stays alive.

---

## 7. Measurement — how to know it's working

Two **non-overlapping** data streams; you need both.

### 7.1 Downstream: AI referral traffic (necessary, but undercounts ~2–3×)

Most AI answers are zero-click; many clicks strip the referrer or land as
"Direct." Referral sessions can **never** be the headline KPI — but set up the
capture anyway (GA4 has **no backfill**):

- **GA4 → Admin → Data Display → Channel Groups → new "AI Traffic" channel**,
  Source matches regex, then **drag it above "Referral"** (GA4 evaluates
  top-down). Regex:

  ```
  chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|claude\.ai|anthropic\.com|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai|you\.com|poe\.com
  ```

  (GA4 natively catches only ChatGPT/Gemini/Claude — Perplexity & Copilot
  otherwise hide in generic Referral.)
- **Google Search Console** for AI-Overview impressions/CTR.
- **Cloudflare/Worker logs** for AI-bot crawl coverage — confirm GPTBot,
  OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended are fetching
  `/releases/*`, `/learn/*`, `/learn/landscape/*` (verify against published IP
  ranges; UAs are spoofable). Crawl coverage is the **leading indicator** of
  citation eligibility. ⚠️ Confirm the Worker isn't stripping the inbound
  `Referer` on AI clicks.

### 7.2 Upstream: answer visibility (the real KPI) — frozen prompt monitoring

The core method, and the discipline that makes or breaks it:

- Build a **frozen** library of 25–50 buyer-relevant prompts grouped by intent.
  For us: *"best AI release tracker"*, *"where to follow new AI model launches"*,
  *"AI influencers to follow"* (→ /influencers), *"what is RAG / vLLM / Ragas"*
  (→ /learn), *"open-source AI tools for X"* (→ /learn/landscape).
- **Do not change the set for 90+ days** — citation share is only comparable
  period-over-period if the prompts are identical.
- **Run each prompt 10+ times** per cycle across engines (variance lives at the
  run level — a 50-prompt set run 10× beats a 500-prompt set run once; ChatGPT
  generates ~91% unique fan-out queries per run, so single runs swing wildly).
- **Treat a move as a trend only if confidence intervals don't overlap.** Report
  monthly minimum; never present a day-over-day delta from a small set as a trend.

**KPI set (with formulas):**

- **Presence rate** = branded mentions ÷ total AI answers × 100
- **Citation/Domain share** = your citations ÷ all citations in the frozen set × 100
- **Share of Voice** = your mentions vs named competitors
- **Average Position** in list-style answers · **Sentiment** distribution
- **Time-to-First-Citation** for new pages (median ~6.8 days, P90 ~37) — a
  meaningful early KPI here: measure how fast a newly-swept release page enters AI
  answers; fast TTFC validates the prerender+JSON-LD pipeline.

### 7.3 Tooling — start fully DIY

Free stack first: GA4 channel + GSC + Worker logs + a tiny prompt harness against
engine free tiers/APIs (fractions of a cent per query). Only graduate to a paid
tool once the frozen set proves we're cited and you need multi-engine automation:
**Otterly.AI** (~$29/mo, SMB), **Peec AI** (€85+), **Semrush AI Toolkit** ($99/mo
if already subscribed), **Ahrefs Brand Radar** (real PAA-derived prompts),
**Profound** (enterprise). Don't buy enterprise before validating a frozen set
manually.

---

## 8. Pitfalls — what NOT to do

- **Don't ship an empty `#root` / JS-gated content.** Invisible to every AI
  engine but Googlebot. The #1 way to silently disappear.
- **Don't keyword-stuff or pad word count.** Stuffing measured **−8.2%**; extra
  words ~0%. Old SEO reflexes backfire in AI answers.
- **Don't fabricate stats/quotes/benchmarks** to game the citation-magnet edits.
  They fail the corroboration/provenance gate, can get a page distrusted, and
  violate our zero-hallucination policy. Being cited as the origin of a *wrong*
  number is a lasting liability.
- **Don't block AI crawlers** "to protect content" — search/user bots
  (OAI-SearchBot, PerplexityBot, ChatGPT-User) are the *path* to citation. The
  `Disallow: /` + `Allow: Googlebot` footgun is the classic silent killer.
- **Don't optimize for one engine.** ChatGPT/Perplexity share only ~11% of cited
  domains; Google-only work leaves you invisible to ChatGPT/Copilot (Bing).
- **Don't report referral sessions as "AI performance."** Structural ~2–3×
  undercount. Lead with citation share.
- **Don't change the prompt set mid-measurement**, and don't call a single-run,
  small-set delta a trend.
- **Don't over-invest in `llms.txt`.** No major engine consumes it (mid-2026).
- **Don't quote undated market-share or stale stats** — shares move ~20 pts in a
  year. Re-verify before quoting.
- **Don't write context-dependent passages** ("as discussed above", unresolved
  pronouns) — they fail the copy-paste test and get dropped at chunk level.
- **Don't fake reviews, mass-pitch AI spam, or thin-parasite-dump** on
  Reddit/Medium — detected, purged, and reputation-poisoning. Genuine
  contribution only.
- **Don't edit your own Wikipedia entry promotionally** — COI reverts. Use
  Wikidata (no notability bar) for controllable entity work; let Wikipedia
  notability come from earned coverage.

---

## 9. Sources

Primary and most-load-bearing (full per-claim source lists are in the research
output; key anchors here):

- **GEO paper** — Aggarwal et al., *GEO: Generative Engine Optimization*, arXiv
  [2311.09735](https://arxiv.org/abs/2311.09735), ACM SIGKDD KDD 2024
  ([dl.acm.org/doi/10.1145/3637528.3671900](https://dl.acm.org/doi/10.1145/3637528.3671900)).
- **Crawlers don't run JS** — Vercel, *The rise of the AI crawler*
  ([vercel.com/blog/the-rise-of-the-ai-crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)).
- **Zero-click 2026** — SparkToro/Similarweb
  ([sparktoro.com](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/)).
- **Per-engine citation patterns / overlap** — Profound
  ([tryprofound.com/blog/ai-platform-citation-patterns](https://www.tryprofound.com/blog/ai-platform-citation-patterns)),
  Yext, Leapd.
- **Retrieval mechanics** — Ziptie (Perplexity / ChatGPT / AI Overviews source
  selection), Google Gemini grounding docs
  ([ai.google.dev/gemini-api/docs/google-search](https://ai.google.dev/gemini-api/docs/google-search)).
- **Top-cited domains** — Semrush
  ([semrush.com/blog/most-cited-domains-ai](https://www.semrush.com/blog/most-cited-domains-ai/)),
  Visual Capitalist, Search Atlas.
- **llms.txt** — spec [llmstxt.org](https://llmstxt.org/); non-adoption: Search
  Engine Roundtable, SE Ranking 300k-domain study.
- **Crawler user-agents** — OpenAI ([platform.openai.com/docs/bots](https://platform.openai.com/docs/bots)),
  Anthropic ([anthropic.com/en/supported-bots](https://www.anthropic.com/en/supported-bots)).
- **Measurement** — Orbit Media / Swydo (GA4), Conductor / Averi (prompt
  tracking), Similarweb (GEO KPIs).

---

*Maintenance: update this file whenever you ship a GEO/AEO change or when a
quoted stat ages past ~6 months. Keep [SEO.md](SEO.md) for classic-SERP work and
this file for AI-answer surfaces. The research backing every number lives in the
session's workflow output (`geo-aeo-research`).*
