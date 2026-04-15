# AI/TLDR Daily Digest Template

## Structure

Start directly with HTML table (no markdown header):

```html
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#050505" style="background-color: #050505;">
<tr>
<td align="center" style="padding: 32px 16px;">

<table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

<!-- HEADER -->
<tr>
<td style="padding-bottom: 24px; border-bottom: 2px solid #f5f5f0;">
<h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #f5f5f0;">AI/TLDR Daily Digest</h1>
<p style="margin: 8px 0 0; font-size: 14px; color: #8a8a85;">{DATE}</p>
</td>
</tr>

{CARDS}

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
```

## Card Template

```html
<!-- CARD: {TITLE} -->
<tr>
<td style="padding-top: 16px;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e" style="background-color: #0e0e0e; border: 1px solid #f5f5f0;">

<!-- Image (omit this <tr> if no image) -->
<tr>
<td>
<img src="{IMAGE_URL}" alt="{TITLE}" width="600" style="width: 100%; height: 220px; object-fit: cover; display: block; border-bottom: 1px solid #f5f5f0;">
</td>
</tr>

<tr>
<td style="padding: 20px;">

<!-- Badges -->
<table cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
<tr>
<td bgcolor="#181818" style="background-color: #181818; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #f5f5f0; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">{CATEGORY}</td>
<td width="8"></td>
<td bgcolor="{IMP_BG}" style="background-color: {IMP_BG}; padding: 4px 10px; font-size: 11px; font-weight: 700; color: {IMP_TEXT}; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">{IMPORTANCE}</td>
<td style="padding-left: 12px; font-size: 13px; color: #8a8a85;">{DATE}</td>
</tr>
</table>

<!-- Title -->
<h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #f5f5f0; line-height: 1.2;">{TITLE}</h2>

<!-- Tagline -->
<p style="margin: 0 0 20px; font-size: 15px; color: #8a8a85; line-height: 1.5;">{TAGLINE}</p>

<!-- Full explainer content -->
<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">What is it?</strong><br>
{WHAT_IS_IT}
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">How does it work?</strong><br>
{HOW_IT_WORKS}
</p>

<p style="margin: 0 0 16px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Why does it matter?</strong><br>
{WHY_IT_MATTERS}
</p>

<p style="margin: 0 0 20px; font-size: 15px; color: #f5f5f0; line-height: 1.6;">
<strong style="color: #f7ff00;">Who is it for?</strong><br>
{FOR_WHO}
</p>

<!-- Footer -->
<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a28; padding-top: 16px;">
<tr>
<td style="font-size: 14px; font-weight: 700; color: #f5f5f0;">{ORG}</td>
<td align="right"><a href="{URL}" style="color: #f7ff00; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">DETAILS →</a></td>
</tr>
</table>

</td>
</tr>
</table>
</td>
</tr>
```

## Design Tokens (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | #050505 | Main background |
| `--bg-2` | #0e0e0e | Card background |
| `--bg-3` | #181818 | Badge background |
| `--fg` | #f5f5f0 | Primary text |
| `--muted` | #8a8a85 | Secondary text, taglines |
| `--line` | #f5f5f0 | Card borders |
| `--line-dim` | #2a2a28 | Internal dividers |
| `--acc` | #f7ff00 | Yellow accent (links, labels) |

## Importance Badge Colors

| Importance | Background | Text |
|------------|------------|------|
| MAJOR | #f7ff00 | #050505 |
| NOTABLE | #181818 | #f5f5f0 |
| SEISMIC | #f7ff00 | #050505 |
| NEW | #00f0a8 | #050505 |
| SECURITY | #ff0040 | #fff |

## Fonts

- **Body:** Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Badges/CTAs:** JetBrains Mono, monospace

## Rules

1. **Dark theme** — Use `bgcolor` on tables for email compatibility
2. **Single column** — 600px max width, centered
3. **Full content** — Include complete What/How/Why/For from releases.json
4. **All links active** — Never mention a tool without linking it
5. **220px images** — Or omit image row if none available
6. **5-8 cards** — Pick most important recent releases
7. **No border-radius** — Brutalist aesthetic
8. **No markdown header** — Start directly with `<table>`

## Content Mapping

From `releases.json` item:

| Field | Source |
|-------|--------|
| IMAGE_URL | `item.image.url` |
| CATEGORY | `item.categories[0]` (uppercase) |
| IMPORTANCE | `item.importance` (uppercase) |
| DATE | `item.date` |
| TITLE | `item.title` |
| TAGLINE | `item.explainer.tagline` |
| WHAT_IS_IT | `item.explainer.whatIsIt` (full text) |
| HOW_IT_WORKS | `item.explainer.howItWorks` (full text) |
| WHY_IT_MATTERS | `item.explainer.whyItMatters` (full text) |
| FOR_WHO | `item.explainer.forWho` (full text) |
| ORG | `item.org` |
| URL | `item.url` |

## Example

See: `newsletters/daily/2026_04_15_daily_digest.md`
