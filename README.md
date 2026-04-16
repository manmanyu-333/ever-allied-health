# Ever Allied Health — Website

Single-page static website for Ever Allied Health, a mobile physiotherapy practice serving Melbourne's northern and eastern suburbs.

## Project Structure

```
ever-allied-health/
├── index.html       Main page (all sections)
├── styles.css       All styles — CSS custom properties, sections, responsive
├── script.js        Mobile nav, smooth scroll, sticky nav shadow
├── assets/
│   ├── logo.svg             Ever Allied Health logo (nav)
│   ├── icon-location.svg    Values section icon
│   ├── icon-heart.svg       Values section icon
│   ├── icon-person.svg      Values section icon
│   ├── icon-map.svg         Service area placeholder icon
│   ├── icon-phone.svg       Contact — Call Us button
│   ├── icon-email.svg       Contact — Email Us button
│   └── team-photo.png       Placeholder — replace with real photo
└── README.md
```

---

## TODO — Before Going Live

### Images
- [ ] **Team photo** (`assets/team-photo.png`) — Replace placeholder with a real photo of Vanessa. Recommended dimensions: 502×628px or similar portrait ratio.

### Contact details
- [ ] **Phone number** — Update `href="tel:+61XXXXXXXXX"` in the Contact section of `index.html` with the real number. Also update the visible link text if needed.
- [ ] **Email address** — Update `href="mailto:hello@everalliedhealth.com.au"` in the Contact section with the real email.

### Form handler
- [ ] **Referral form** — The current design links the CTAs to the contact section. If a proper referral form is needed, embed one (e.g. Tally, Typeform, or a custom form) in the Contact section. Add a server-side handler or third-party form service to process submissions.

### Maps
- [ ] **Google Maps embed** — Replace the map placeholder in the Service Area section with a real `<iframe>` Google Maps embed. Example:
  ```html
  <iframe
    src="https://www.google.com/maps/embed?pb=..."
    width="100%" height="400"
    style="border:0;" allowfullscreen="" loading="lazy">
  </iframe>
  ```
  Search "Google Maps embed generator" and centre the map on Rosanna, VIC, showing the service area.

### Analytics / SEO
- [ ] Add a `<link rel="icon">` (favicon) in the `<head>` of `index.html`.
- [ ] Add Open Graph meta tags for social sharing previews.
- [ ] Connect Google Analytics or Plausible if required.

---

## Deploying to Vercel

### Option A — Drag and drop (fastest)
1. Go to [vercel.com](https://vercel.com) and sign in (free account is fine).
2. From the dashboard click **Add New → Project**.
3. Choose **"Deploy without a Git repository"** → drag the `ever-allied-health` folder into the upload area.
4. Click **Deploy**. Vercel gives you a live URL in ~30 seconds.

### Option B — Connect GitHub (recommended for ongoing updates)
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
3. Import your GitHub repo.
4. Vercel auto-detects this as a static site — no build settings needed. Click **Deploy**.
5. Every push to `main` will trigger an automatic redeploy.

### Custom domain
After deploying, go to **Project Settings → Domains** in Vercel and add your custom domain (e.g. `everalliedhealth.com.au`). Vercel will guide you through the DNS setup.

---

## Development

No build tools needed. Open `index.html` directly in a browser by double-clicking the file.

For live-reload during editing, you can use any static server:
```bash
# Python (built-in)
python3 -m http.server 8080

# Node (if installed)
npx serve .
```

Then open `http://localhost:8080` in your browser.
