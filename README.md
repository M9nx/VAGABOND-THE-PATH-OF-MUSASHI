# Vagabond — The Path of Musashi

A cinematic, editorial landing-page tribute to Miyamoto Musashi from Takehiko Inoue’s *Vagabond*.

Built with **Astro**, **TypeScript**, plain CSS, and **GSAP** + **ScrollTrigger**.

---

## Tech stack

- Astro 5
- TypeScript
- Plain CSS with design tokens
- GSAP 3 + ScrollTrigger
- Native HTML5 video

---

## Project structure

```
vagabond-landing-page/
├── public/
│   ├── videos/              # Hero video (kept in public for direct URL)
│   ├── fonts/               # (empty — uses system fonts)
│   └── textures/            # (empty — texture is generated in CSS)
├── src/
│   ├── assets/
│   │   └── images/          # Organized by chapter
│   │       ├── beast/
│   │       ├── fear/
│   │       ├── awareness/
│   │       ├── other-path/
│   │       ├── strength/
│   │       ├── ending/
│   │       └── shared/      # Unused original assets preserved
│   ├── components/
│   │   ├── navigation/      # SiteHeader, ChapterNavigation, MobileNavigation
│   │   ├── hero/            # Hero, ScrollIndicator
│   │   ├── editorial/       # ChapterSection, ChapterHeader, ChapterMetadata,
│   │   │                    EditorialImage, EditorialGallery,
│   │   │                    EditorialQuote, ImageCaption
│   │   └── SiteFooter.astro
│   ├── data/
│   │   └── chapters.ts      # Typed, data-driven chapter content
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── scripts/
│   │   ├── animations/      # hero, chapter-headings, image-reveals,
│   │   │                    quotes, navigation
│   │   └── initialize-animations.ts
│   └── styles/
│       ├── reset.css
│       ├── tokens.css
│       ├── typography.css
│       ├── global.css
│       ├── editorial.css
│       ├── motion.css
│       └── responsive.css
├── docs/refactor/
│   ├── current-prototype-audit.md
│   └── performance-notes.md
└── package.json
```

---

## Available commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build static site
npm run preview    # Preview the built site
npm run astro      # Run Astro CLI
npm run astro check # Type-check Astro and TypeScript files
```

---

## Adding Chapter 07

1. **Add a new chapter entry** in `src/data/chapters.ts`:

```typescript
{
  id: 'chapter-seven',
  number: '07',
  navigationLabel: 'The New Chapter',
  eyebrow: 'Eyebrow text',
  title: 'The chapter title',
  meta: [
    { label: 'Theme', value: 'Value' },
    // ... up to 4 metadata items
  ],
  narrativeVariant: 'offset', // or 'columns'
  narrative: [
    'First paragraph.',
    'Second paragraph.',
  ],
  featuredImage: {
    src: importedImage,
    alt: 'Description',
    number: '11',
    title: 'Image title',
    description: 'Optional longer description',
    variant: 'wide', // 'wide' | 'fullscreen' | 'small' | 'large' | 'portrait' | 'landscape' | 'square'
    overlay: 'yellow', // 'yellow' | 'red' | 'dark'
  },
  quote: {
    text: 'A large editorial quote.',
    wide: true,
  },
}
```

2. **Import the new image** at the top of `src/data/chapters.ts`:

```typescript
import chapterSevenImage from '~/assets/images/ending/new-chapter.png';
```

3. **Place the image** in `src/assets/images/ending/` (or create a new `chapter-seven/` folder).

4. **The navigation is generated automatically** from `chapters.ts`, so the new chapter will appear in the header, mobile menu, and footer.

5. **The chapter layout is rendered automatically** by `ChapterSection.astro`. No page markup duplication is required.

---

## Design tokens

Colors and spacing live in `src/styles/tokens.css`:

- `--paper` / `--paper-light` / `--paper-deep` — cream backgrounds
- `--ink` / `--ink-soft` — black text and dark sections
- `--red` — accent for chapter numbers and labels
- `--yellow` — manga overlay treatment
- `--page-gutter`, `--section-space`, `--content-max`, `--header-height`

---

## Performance notes

See `docs/refactor/performance-notes.md` for:

- Original vs. optimized asset sizes
- Image optimization decisions
- Video size recommendations
- JavaScript bundle size
- Remaining performance risks

---

## Accessibility

- Skip-to-content link
- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`, `figure`, `figcaption`, `blockquote`)
- One `h1` per page
- Mobile menu with focus trap, `Escape` close, and `aria-expanded`/`aria-hidden` state
- `prefers-reduced-motion` support disables scrubbed animations and parallax
- All content remains visible without JavaScript

---

## License & credits

Educational fan project. *Vagabond* and its characters belong to their respective creators and publishers.

Inspired by Takehiko Inoue’s *Vagabond*.
