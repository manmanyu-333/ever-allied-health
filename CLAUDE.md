# Ever Allied Health — Claude Context

## What this project is
Static marketing website for Ever Allied Health, a mobile physiotherapy practice in Melbourne run by Vanessa Tam. One-page site with anchored sections. No framework, no build step — plain HTML/CSS/JS.

Production domain: **everalliedhealth.com.au**

---

## Tech stack
- `index.html` — single page, all sections
- `styles.css` — all styles, desktop-first (1440px), breakpoints at 1024px and 768px
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

**Hosting pipeline:** The production domain is `everalliedhealth.com.au` — ask Amanda how pushes get deployed (Netlify, GitHub Pages, manual FTP, etc.) as this wasn't confirmed during setup.

---

## Contact form
Formspree endpoint: `https://formspree.io/f/mnjldear`
Fields: name, contact (phone or email), suburb, funding_type (select), notes.

---

## What's still placeholder / TODO (as of last session)
- Team photo (`assets/team-photo.png`) is a placeholder div — real photo not yet added
- Google Maps embed in the Service Area section is a placeholder
- `og-image.jpg` for Open Graph sharing not yet created
- `[phone]` in JSON-LD schema is still a placeholder
- Social media URLs in JSON-LD are placeholders
