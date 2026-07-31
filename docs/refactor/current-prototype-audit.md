# Current Prototype Audit — Vagabond Editorial Landing Page

**Project:** Vagabond — The Path of Musashi  
**Audit date:** 2026-07-31  
**Auditor:** OpenCode (frontend architect)  
**Scope:** The existing single-file editorial prototype only. Any volume/archive/dashboard prototype is explicitly out of scope.

---

## 1. Existing Page Structure

The prototype is a single `index.html` file containing:

1. `<header class="site-header">` — fixed navigation bar.
2. `<main>` with:
   - `<section id="home" class="hero">` — full-screen video hero.
   - `<section id="introduction" class="introduction">` — prologue statement + project meta.
   - `<section id="chapter-one" class="chapter chapter--beast">` — Chapter 01 The Beast.
   - `<section id="chapter-two" class="chapter chapter--fear">` — Chapter 02 Fear.
   - `<section id="chapter-three" class="chapter chapter--awareness">` — Chapter 03 Awareness.
   - `<section id="chapter-four" class="chapter chapter--other-path">` — Chapter 04 The Other Path.
   - `<section id="chapter-five" class="chapter chapter--strength">` — Chapter 05 True Strength.
   - `<section id="chapter-six" class="chapter chapter--ending">` — Chapter 06 The Endless Path.
3. `<footer class="site-footer">` — brand, chapter links, credits, disclaimer.

Headings: a single `<h1>` in the hero (`Vagabond`), chapter titles use `<h2>`, comparison titles use `<h3>`, footer column labels use `<h2>`.

---

## 2. Existing Assets

### Images (`assets/images/`)

| File | Size (KB) | Used in HTML? | Notes |
|------|-----------|---------------|-------|
| `_illustration._this_is_an.png` | 1 988.80 | Yes (ch. 03 forest) | Very large PNG; candidate for optimization |
| `_white_ink_illustration_of_a_desolate.png` | 1 337.22 | Yes (ch. 02 after battle) | Very large PNG; candidate for optimization |
| `a_high_quality_high_resolution_version_of_this_black_and_white_ink.png` | 961.54 | Yes (ch. 01 gallery large) | Large PNG; candidate for optimization |
| `a_high_quality_high_resolution_version_of_this_black_and_white_ink (1).png` | 429.73 | Yes (ch. 01 wide hero image) | Large PNG; candidate for optimization |
| `Miyamoto Musashi.jpg` | 93.54 | No | Unused in current index.html |
| `128.webp` | 74.53 | No | Unused in current index.html |
| `𝐕𝐚𝐠𝐚𝐛𝐨𝐧𝐝2.jpg` | 42.08 | No | Unused in current index.html |
| `Vagabond.jpg` | 35.03 | No | Unused in current index.html |
| `download (22).jpg` | 27.89 | No | Unused in current index.html |
| `Miyamoto Musashi from Vagabond - Takehiko Inoue.jpg` | 25.26 | No | Unused in current index.html |

### Referenced but missing images

The current HTML references the following files that do **not** exist in `assets/images/`:

- `musashi-praying.png`
- `musashi-ocean.png`
- `musashi-portrait.png`
- `musashi-mountain.png`
- `musashi-clouds.png`

These missing images will need replacement or removal during migration to avoid broken links.

### Video

- `assets/videos/musashi-hero.mp4` — 87.39 MB (≈ 89 482 KB). Used in the hero. Extremely large for web delivery; must be optimized or documented as a performance risk.

### Fonts / Textures / Icons

- No custom font files or icon sets are present.
- A fixed paper-grain overlay is generated purely with CSS (`body::before`).
- The kanji `武蔵` is rendered as inline text, not an image.

---

## 3. Current Visual System

### Color palette (CSS custom properties)

| Token | Value | Role |
|-------|-------|------|
| `--paper` | `#e8e0d2` | Primary page background (cream) |
| `--paper-light` | `#f4efe6` | Lighter cream variant |
| `--paper-deep` | `#d8cebe` | Deep cream |
| `--ink` | `#11110f` | Primary text / dark sections |
| `--ink-soft` | `#24231f` | Softer black |
| `--muted` | `#6f6a61` | Muted text on light backgrounds |
| `--muted-light` | `#afa89d` | Muted text on dark backgrounds |
| `--red` | `#8a211c` | Accent (chapter numbers, labels) |
| `--red-dark` | `#5f1613` | Dark red variant |
| `--white` | `#fffdf8` | Off-white |
| Yellow overlay | `#d8aa18` | Manga-image multiply overlay |

### Typography

- Sans-serif stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`
- Display stack: `"Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif`
- Serif stack: `"Iowan Old Style", Baskerville, "Times New Roman", serif`
- Large condensed display type for hero (`clamp(5.2rem, 15vw, 14.5rem)`) and chapter headings.

### Spacing

- Page gutter: `clamp(1.25rem, 3vw, 3.75rem)`
- Section vertical space: `clamp(6rem, 12vw, 13rem)`
- Header height: `4.75rem` desktop, `4.25rem` tablet/mobile
- Content max-width: `100rem`

### Key visual treatments

- Full-screen hero video with dark gradient overlay and grayscale/contrast filter.
- Oversized uppercase condensed typography (`VAGABOND` / `Vagabond`).
- Cream-and-ink alternating section backgrounds.
- Red accent for chapter numbers and labels.
- Yellow multiply overlay (`#d8aa18`, opacity 0.9) on selected manga images.
- Asymmetric two-column galleries.
- Editorial captions with numbered labels and top borders.
- Large display quotes with tight line-height.
- Fixed paper-grain texture overlay across the whole page.

---

## 4. Existing Reusable Patterns

### Repeated markup blocks

1. **Site header** — brand, current chapter indicator, link list.
2. **Chapter header** — `chapter__identity` (number + label), `chapter__title`, `chapter-meta` (2×2 definition list).
3. **Editorial image** — `<figure class="editorial-image editorial-image--{variant}">` with `<img>` and `<figcaption class="image-caption">`.
4. **Image caption** — number, title, optional description.
5. **Chapter narrative** — offset or columnar paragraph layout.
6. **Editorial quote** — `<blockquote class="editorial-quote">`.
7. **Comparison layouts** — `comparison` (Musashi vs. Kojirō) and `belief-comparison` (Then vs. Now).
8. **Footer** — brand, chapter nav, credits, disclaimer.

### Layout systems used

- **CSS Grid:** site-nav (`3-col`), introduction header/body, chapter header (`3-col`), chapter narratives (`offset` / `columns`), image captions (`3-col`), galleries (`split` / `asymmetric`), comparison grids, footer.
- **Flexbox:** brand alignment, header center chapter indicator, hero footer, navigation link list, comparison side internal layout.

---

## 5. Current Problems

### Asset problems

- Hero video is 87 MB — unsuitable for web delivery without optimization.
- Four PNGs used in-page total ~4.7 MB uncompressed-weight; optimization is required.
- Five image references in the HTML are 404s (`musashi-*.png`).
- Hero video `<video>` `poster` attribute points to `assets/images/` (a directory), which is invalid.
- An external image URL (`https://i.pinimg.com/...`) is used in Chapter 01; this is a third-party dependency and performance/privacy risk.

### Layout / overflow problems

- Navigation links can collide on medium widths; the current `1180px` breakpoint removes the chapter indicator but does not solve brand/link collision at very large font sizes.
- The oversized hero title can cause horizontal overflow on extremely narrow viewports if not carefully clamped.
- `editorial-image--fullscreen` uses `width: calc(100% + (var(--page-gutter) * 2))` with negative margins; this is acceptable but fragile if parent padding changes.
- Fixed header height is set in `:root`; mobile override lives inside a media query and must be synchronized.

### Accessibility / semantic problems

- The current chapter indicator (`<p class="site-nav__chapter">`) has `aria-label="Current chapter"` on a `<p>`; ARIA labels on non-interactive elements are not consistently announced.
- Footer uses `<h2>` for column labels; because these sit after the main content, the heading outline is acceptable, but they could be visually styled headings instead of section headings to avoid an awkward outline.
- Mobile menu button is present in CSS but absent from HTML; the menu is not actually implemented.
- Skip-to-content link is missing.
- `:target` scroll-margin is 5rem but the header is ~4.75rem; close but not exact across breakpoints.
- No `aria-current` for active navigation item.

### Performance problems

- No image dimensions or explicit aspect ratios on most `<img>` tags (CSS aspect-ratio is used for some variants only).
- No `loading="lazy"` on below-the-fold images.
- No `fetchpriority` on hero media.
- Video is 87 MB and not optimized.
- External image URL is not cached locally.
- No preconnect hints.

### Maintainability problems

- All chapter markup is duplicated inline; adding Chapter 07 requires copying ~100 lines of HTML.
- CSS is a single large file (`style.css` 1 133 lines) with a separate `responsive.css`; shared patterns are not componentized.
- Image overlay logic is split between `.editorial-image--*` modifiers and `.image-layer--yellow`; inconsistent.

---

## 6. Migration Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing manga images cause broken visuals | High | Replace missing references with existing assets or placeholder treatment; document every substitution |
| 87 MB video breaks build / preview | High | Keep video in `public/`; document optimization recommendation; generate a poster fallback |
| Re-creating asymmetric layouts in components may shift composition | Medium | Match existing CSS Grid/Flexbox values exactly in component styles |
| Astro image optimization may change file names/paths | Low | Use `~/assets/` imports and verify build output |
| GSAP animations may hide content if JS fails | High | Render complete static content; use `prefers-reduced-motion`; no `opacity: 0` initial states without `.js` class |
| Mobile menu behavior must be rebuilt | Medium | Implement accessible disclosure pattern with focus trap and Escape handling |
| Large PNG optimization could reduce line quality | Medium | Use lossless PNG compression first; WebP/AVIF only where quality is preserved |

---

## 7. Proposed Astro Architecture

```text
src/
├── assets/
│   └── images/
│       ├── beast/
│       ├── fear/
│       ├── awareness/
│       ├── other-path/
│       ├── strength/
│       └── ending/
├── components/
│   ├── navigation/
│   │   ├── SiteHeader.astro
│   │   ├── ChapterNavigation.astro
│   │   └── MobileNavigation.astro
│   ├── hero/
│   │   ├── Hero.astro
│   │   └── ScrollIndicator.astro
│   ├── editorial/
│   │   ├── ChapterSection.astro
│   │   ├── ChapterHeader.astro
│   │   ├── ChapterMetadata.astro
│   │   ├── EditorialImage.astro
│   │   ├── EditorialGallery.astro
│   │   ├── ImageCaption.astro
│   │   └── EditorialQuote.astro
│   └── SiteFooter.astro
├── data/
│   └── chapters.ts
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   └── index.astro
├── scripts/
│   ├── animations/
│   │   ├── hero.ts
│   │   ├── chapter-headings.ts
│   │   ├── image-reveals.ts
│   │   ├── quotes.ts
│   │   └── navigation.ts
│   └── initialize-animations.ts
└── styles/
    ├── reset.css
    ├── tokens.css
    ├── typography.css
    ├── global.css
    ├── editorial.css
    ├── motion.css
    └── responsive.css

public/
├── videos/
│   └── musashi-hero.mp4
├── fonts/
└── textures/
```

Key architectural decisions:

- **Plain Astro components** with zero framework islands.
- **Data-driven chapters** via `src/data/chapters.ts` with strongly typed TypeScript.
- **Plain CSS** split by concern: tokens, typography, global, editorial, motion, responsive.
- **GSAP loaded only on the client** for users who have motion enabled.
- **All static content rendered server-side**; animations are progressive enhancement.

---

## 8. Preservation Requirements

The following must be preserved exactly unless a documented correction is required:

- All written content (hero text, introduction, every chapter paragraph, quote, caption, metadata value).
- Chapter order: 00 Introduction → 01 The Beast → 02 Fear → 03 Awareness → 04 The Other Path → 05 True Strength → 06 The Endless Path.
- Cream/black/red/yellow visual identity.
- Hero composition: full-screen video, oversized title, eyebrow, subtitle, question, kanji, chapter label, scroll link.
- Alternating section backgrounds (cream for introduction/beast/awareness/strength; ink for fear/other-path/ending).
- Yellow multiply overlay on selected manga images.
- Asymmetric editorial gallery layouts.
- Editorial caption style with numbered labels.
- CSS Grid and Flexbox concepts used in the current layout.

Allowed corrections (must be documented):

- Typographical errors.
- Broken punctuation.
- Inconsistent capitalization.
- Accessibility improvements such as `aria-current`, skip link, alt text, and semantic markup.
