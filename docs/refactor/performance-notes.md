# Performance Notes — Vagabond Astro Refactor

**Project:** Vagabond — The Path of Musashi  
**Date:** 2026-07-31

---

## Original asset sizes

| Asset | Original size | Role |
|-------|---------------|------|
| `assets/images/_illustration._this_is_an.png` | 1 988.80 KB | Chapter 03 wide image |
| `assets/images/_white_ink_illustration_of_a_desolate.png` | 1 337.22 KB | Chapter 02 fullscreen image |
| `assets/images/a_high_quality_high_resolution_version_of_this_black_and_white_ink.png` | 961.54 KB | Chapter 01 gallery large |
| `assets/images/a_high_quality_high_resolution_version_of_this_black_and_white_ink (1).png` | 429.73 KB | Chapter 01 featured image |
| `assets/images/Miyamoto Musashi.jpg` | 93.54 KB | Unused in original HTML |
| `assets/images/128.webp` | 74.53 KB | Unused in original HTML |
| `assets/images/𝐕𝐚𝐠𝐚𝐛𝐨𝐧𝐝2.jpg` | 42.08 KB | Unused in original HTML |
| `assets/images/Vagabond.jpg` | 35.03 KB | Unused in original HTML |
| `assets/images/download (22).jpg` | 27.89 KB | Unused in original HTML |
| `assets/images/Miyamoto Musashi from Vagabond - Takehiko Inoue.jpg` | 25.26 KB | Unused in original HTML |
| `assets/videos/musashi-hero.mp4` | 87.39 MB | Hero background video |

**Total original images in use:** ~4.72 MB uncompressed PNGs.

**Original performance problems:**
- 87.39 MB hero video is far larger than recommended for web delivery.
- Large PNGs were served without optimization or responsive sizes.
- An external image (`https://i.pinimg.com/...`) was used in Chapter 01, creating a third-party dependency.
- Five image references pointed to missing files (`musashi-*.png`).
- No `loading="lazy"`, `fetchpriority`, or explicit dimensions on most images.
- Hero video `poster` attribute pointed to a directory path (`assets/images/`).

---

## Final asset sizes

### Source assets after reorganization

| New path | Source file | Size |
|----------|-------------|------|
| `src/assets/images/awareness/forest.png` | `_illustration._this_is_an.png` | 1 988.80 KB |
| `src/assets/images/fear/after-battle.png` | `_white_ink_illustration_of_a_desolate.png` | 1 337.22 KB |
| `src/assets/images/beast/battlefield.png` | `a_high_quality...black_and_white_ink.png` | 961.54 KB |
| `src/assets/images/beast/portrait.png` | `a_high_quality...black_and_white_ink (1).png` | 429.73 KB |
| `src/assets/images/other-path/portrait.jpg` | `Miyamoto Musashi.jpg` | 93.54 KB |
| `src/assets/images/shared/128.webp` | `128.webp` | 74.53 KB |
| `src/assets/images/ending/clouds.jpg` | `𝐕𝐚𝐠𝐚𝐛𝐨𝐧𝐝2.jpg` | 42.08 KB |
| `src/assets/images/strength/mountain.jpg` | `Vagabond.jpg` | 35.03 KB |
| `src/assets/images/awareness/ocean.jpg` | `download (22).jpg` | 27.89 KB |
| `src/assets/images/awareness/praying.jpg` | `Miyamoto Musashi from Vagabond - Takehiko Inoue.jpg` | 25.26 KB |
| `public/videos/musashi-hero.mp4` | `musashi-hero.mp4` | 87.39 MB |

### Optimized build output (selected WebP variants)

| Role | Largest generated WebP | Smallest generated WebP |
|------|------------------------|-------------------------|
| Chapter 03 forest | 284.44 KB | 34.16 KB |
| Chapter 02 after-battle | 184.47 KB | 17.26 KB |
| Chapter 01 battlefield | 91.01 KB | 13.00 KB |
| Chapter 01 portrait | 58.61 KB | 6.00 KB |
| Other-path portrait | 87.12 KB | 26.56 KB |
| Strength mountain | 30.45 KB | 11.00 KB |
| Ending clouds | 27.82 KB | 12.00 KB |
| Awareness ocean | 19.47 KB | 8.00 KB |
| Awareness praying | 14.85 KB | 8.00 KB |

**JavaScript shipped to the browser:**
- One bundled module: `index.astro_astro_type_script_index_0_lang.*.js`
- Raw size: ~119.53 KB
- Gzipped: ~46.81 KB
- Includes GSAP + ScrollTrigger + navigation logic.

**CSS:** bundled into a single CSS file by Astro.

---

## Image optimization decisions

- **Astro Image component** is used for all chapter images with `widths` and `sizes` to produce responsive `srcset` variants.
- **WebP output** is generated automatically for all images, dramatically reducing transfer sizes compared to the original PNGs.
- **Lazy loading** is applied to all images below the hero. The hero poster and the first chapter images use `eager` loading.
- **Explicit dimensions** are inferred by Astro from source files and rendered as `width`/`height` attributes to prevent layout shifts.
- **Aspect ratios** are preserved via CSS `aspect-ratio` for each image variant.
- **The external `pinimg.com` image was removed** from Chapter 01 and replaced with a local asset (`Miyamoto Musashi.jpg`) to eliminate a third-party request.
- **Missing `musashi-*.png` references** were replaced with available local assets. The substitutions are documented in the audit file.
- **The `128.webp` file (128 px wide)** is no longer used as a gallery image because it would be upscaled by the responsive image pipeline. It is kept in `src/assets/images/shared/` as an original asset.

## Video optimization recommendations

The hero video remains **87.39 MB** in `public/videos/musashi-hero.mp4`. This is the single largest performance risk.

Recommended next steps:
1. Re-encode the MP4 with H.264 or H.265 at a lower bitrate and resolution.
2. Provide a WebM fallback for better compression.
3. Consider a shorter loop or a compressed still poster as the default hero experience.
4. Use a CDN or video hosting service for production delivery.

The current implementation does add a poster image and `playsinline`/`muted`/`autoplay`/`loop` attributes, which improves the fallback experience.

## Remaining performance risks

- The 87.39 MB video will dominate the page weight and may cause slow load times on constrained connections.
- Four PNG source files remain large (1–2 MB) and should be replaced with pre-optimized WebP/AVIF sources if possible.
- The GSAP bundle is required for navigation tracking even for users who prefer reduced motion.
- No service worker or preloading strategy is implemented for critical assets.
- No `preload` is added for the hero video because its large size makes preloading risky.

## JavaScript shipped to the browser

| Module | Size (raw) | Size (gzip) |
|--------|------------|-------------|
| Main bundle (GSAP + ScrollTrigger + animations + navigation) | ~119.53 KB | ~46.81 KB |

No framework hydration, React islands, or unnecessary client-side code are shipped.

## Responsive image strategy

- `sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 100rem"`
- `widths=[400, 800, 1200, 1600, 2000]`
- Mobile devices receive smaller variants; desktop receives the full-resolution variant.

## Notes for future maintenance

- When adding a new chapter, import its image in `src/data/chapters.ts` and use the Astro `Image` component through `EditorialImage.astro`.
- Keep source images reasonably sized (preferably under 500 KB) to avoid long build times and large output variants.
- If the hero video is re-encoded, replace `public/videos/musashi-hero.mp4` and add a `<source>` with the same path.
