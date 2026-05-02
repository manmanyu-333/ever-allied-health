# Ever Allied Health — Claude Context

## What this project is
Static marketing website for Ever Allied Health, a mobile physiotherapy practice in Melbourne run by Vanessa Tam. Three-page site. No framework, no build step — plain HTML/CSS/JS.

Production domain: **everalliedhealth.com.au**

---

## Site structure
- `index.html` — home page (hero, values, stats, who-we-see preview, contact)
- `who-we-are.html` — page 2 (hero, our philosophy, why choose us, meet the team)
- `who-we-see.html` — page 3 (client types, funding, service area, how to refer)
- `contact.html` — contact page (referral steps, contact form)
- `styles.css` — shared styles, desktop-first (1440px), breakpoints at 1024px and 768px
- `script.js` — bokeh canvas animation, mobile nav, scroll reveal, Formspree contact form
- `assets/` — SVG icons, logo, hero-bg.jpg, team photo placeholder
- No build step, no package manager, no framework

---

## Design system (defined in `:root` in styles.css)
| Token | Value | Use |
|---|---|---|
| `--color-dark-green` | `#454411` | Nav CTA, stats bg, quote bg, footer bg |
| `--color-olive` | `#454411` | Body text, headings |
| `--color-olive-mid` | `#4a4a28` | Secondary text |
| `--color-gold` | `#b8962e` | Accents, stat numbers, step numbers |
| `--color-cream` | `#f5e8d5` | Light section backgrounds |
| `--color-white` | `#ffffff` | Page background |

**Fonts:** `EB Garamond` (serif — headings/display) + `Red Hat Text` (sans — body/UI), loaded from Google Fonts.

---

## Hero section (last updated this session)
The hero has a layered background:
1. `.hero` base: `rgb(39, 44, 18)` — dark green
2. `.hero-bg-photo` — `assets/hero-bg.jpg` at 8% opacity (elderly mobile physio photo from Figma reference)
3. `#hero-canvas` — animated bokeh dots (JS)

Text and buttons are `#fffaf6` (off-white). Primary button is cream fill (`#fcf3ea`) with dark green text; outline button is cream border/text.

Bokeh canvas settings (script.js): ~51–94 orbs, speed `0.036–0.162 px/frame`, omnidirectional random-walk motion (no upward bias), opacity capped at 0.68/0.49/0.30 by size tier.

---

## Dev server
```bash
python3 -m http.server 8080
```
Run from the project root (`/Users/amandayu/Desktop/ever-allied-health`). Open at http://localhost:8080. Always do a **hard refresh (Cmd+Shift+R)** after JS changes — browser caches the script.

---

## Git / deployment — IMPORTANT
**GitHub Desktop is logged in as the WORK account. Do not use it for this project.**

This is a personal project on GitHub under account **`manmanyu-333`**. The remote URL already has a personal access token embedded, so terminal git works directly:

```bash
git add <files>
git commit -m "..."
git push origin main
```

No extra auth steps needed — the PAT in the remote URL handles it.

**Hosting pipeline:** The production domain is `everalliedhealth.com.au`, hosted on **Vercel**. Vercel auto-deploys on every push to `main` (no `vercel.json` in the repo — uses defaults for a static site). A static deploy completes in roughly 30 seconds. After deploy, do a hard refresh (Cmd+Shift+R) to bust browser cache for HTML; if the page still looks stale, check the Vercel dashboard to confirm the latest commit deployed successfully.

---

## Contact form
Formspree endpoint: `https://formspree.io/f/mnjldear`
Fields: name, contact (phone or email), suburb, funding_type (select), notes.

---

## Card style system
Three named card styles are used across the site. Always use these names consistently:

**Style 1 — Icon card** (e.g. `.value-block` on `index.html`, `.why-choose-block` on `who-we-are.html`)
- `background: transparent`
- `border: 1px solid rgba(180, 165, 140, 0.55)` — warm tan
- `border-radius: 4px`, `padding: 40px`, `min-height: 460px`
- Icon: 60×60px, `margin-bottom: 48px`, gold stroke `var(--stroke-0, #B8962E)` at `stroke-width="1.5"`
- `::after` pseudo-element: 1px horizontal rule near bottom, same tan colour
- Text: `var(--color-olive-mid)`, left-aligned

**Style 2 — Outlined card** (e.g. `.client-card` on `index.html`, `.philosophy-card` on `who-we-are.html`, `.wws-card` on `who-we-see.html`)
- No background fill
- `border: 1px solid var(--color-dark-green)`
- `border-radius: 4px`
- Text: `var(--color-dark-green)` for both h3 and p

**Style 3 — Filled card** (plain white, used sparingly)
- `background: var(--color-white)`, no border, no radius

---

## Section background colours
- Cream/warm: `#faf1eb` — used for values, who-we-see cards, service area, why-choose, contact refer
- White: `#ffffff` — used for philosophy section background (`--color-cream-mid`)
- Dark green: `#45441a` — formerly used for why-choose (now replaced with cream)

---

## Suburb pills (who-we-see.html — Service Area)
- `border: 1.5px solid #45441a`, `border-radius: 4px`
- `background: rgba(255, 255, 255, 0.2)` — 20% white over cream bg
- Callout banner (`.wws-service-callout`): `border-left: 2px solid var(--color-dark-green)`

---

## What's still placeholder / TODO
- Team photo (`assets/team-photo.png`) is a placeholder div — real photo not yet added
- Google Maps embed in the Service Area section is a placeholder
- `og-image.jpg` for Open Graph sharing not yet created
- `[phone]` in JSON-LD schema is still a placeholder
- Social media URLs in JSON-LD are placeholders
