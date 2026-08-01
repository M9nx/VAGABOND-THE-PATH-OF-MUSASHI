# Vagabond — The Path of Musashi

A cinematic, editorial landing-page tribute to Miyamoto Musashi from Takehiko Inoue’s *Vagabond*.

Built with **Astro**, **TypeScript**, plain CSS, **GSAP** + **ScrollTrigger**, and **Lenis**.

**Live site:** https://M9nx.github.io/Vagabond-Landing-Page/

---

## Development

```bash
npm install
npm run dev
```

Open the local URL Astro prints. With the GitHub Pages `base` configured, the app is served under `/Vagabond-Landing-Page/`.

## Validation

```bash
npm run "astro check"
npm run build
```

Optional browser matrix:

```bash
node scripts/validate-responsive.mjs
```

## Production preview

```bash
npm run build
npm run preview
```

## Deployment

Pushing to `main` deploys automatically to **GitHub Pages** through GitHub Actions (`.github/workflows/deploy-pages.yml`).

Manual deploy: repository **Actions** → **Deploy Astro to GitHub Pages** → **Run workflow**.

Pages source must be set to **GitHub Actions** (Settings → Pages).

See `docs/deployment/github-pages.md` for base-path details, rollback, and custom-domain notes.

---

## Tech stack

- Astro 5 (static output)
- TypeScript
- Plain CSS with design tokens
- GSAP 3 + ScrollTrigger
- Lenis smooth scrolling (fine pointer / non-reduced-motion)
- Native HTML5 video (WebM + MP4)

---

## Project structure

```
vagabond-landing-page/
├── public/
│   ├── videos/              # Optimized hero video (mp4 + webm)
│   └── favicon.svg
├── src/
│   ├── assets/images/       # Chapter imagery
│   ├── components/
│   ├── data/chapters.ts
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── .github/workflows/
│   ├── deploy-pages.yml
│   └── quality.yml
└── docs/
    ├── deployment/github-pages.md
    └── refactor/
```

---

## Adding Chapter 07

1. Add a chapter entry in `src/data/chapters.ts`.
2. Import imagery at the top of that file.
3. Navigation/footer update automatically from the data module.

---

## Performance notes

See `docs/refactor/performance-notes.md` for hero video before/after sizes and responsive image strategy.

---

## Accessibility

- Skip-to-content link
- Semantic landmarks
- Mobile menu focus trap, Escape, `aria-expanded` / `aria-hidden`
- `prefers-reduced-motion` disables Lenis and heavy motion
- Content remains available without JavaScript

---

## License & credits

Educational fan project. *Vagabond* and its characters belong to their respective creators and publishers.

Inspired by Takehiko Inoue’s *Vagabond*.
