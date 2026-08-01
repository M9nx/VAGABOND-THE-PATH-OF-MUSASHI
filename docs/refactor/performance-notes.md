# Performance Notes — Vagabond Astro Refactor

**Project:** Vagabond — The Path of Musashi  
**Updated:** 2026-08-01

---

## Hero video optimization

### Before

| Property | Value |
|----------|-------|
| Path | `public/videos/musashi-hero.mp4` |
| Size | **87.39 MB** (91,629,993 bytes) |
| Resolution | 3840 × 2160 |
| Frame rate | 60 fps |
| Video codec | H.264 |
| Audio | AAC present (~320 kbps) |
| Duration | ~17.98 s |
| Bitrate | ~40.8 Mbps |

### After

| Variant | Size | Resolution | Codec | Audio | Notes |
|---------|------|------------|-------|-------|-------|
| `public/videos/musashi-hero.mp4` | **2.89 MB** | 1920 × 1080 | H.264 (CRF 23, faststart) | Removed | Primary compatibility |
| `public/videos/musashi-hero.webm` | **1.90 MB** | 1920 × 1080 | VP9 (CRF 32) | Removed | Preferred modern source |

**Reduction:** 87.39 MB → 2.89 MB MP4 (**~97% smaller**). WebM is smaller still at 1.90 MB.

### Encode commands used

```bash
ffmpeg -y -i public/videos/musashi-hero.mp4 -an \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart \
  public/videos/musashi-hero.optimized.mp4

ffmpeg -y -i public/videos/musashi-hero.mp4 -an \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 \
  public/videos/musashi-hero.webm
```

### Delivery notes

- Hero uses `preload="metadata"` (does not preload the full video).
- Source order prefers WebM, then MP4.
- Paths use `import.meta.env.BASE_URL` so GitHub Pages project deploys resolve correctly.
- Poster image remains the Astro-optimized beast portrait.

---

## Responsive images

`EditorialImage.astro` now sets variant-aware `sizes` values so mobile devices request narrower `srcset` candidates than desktop fullscreen/wide frames.

Example widths: `[400, 800, 1200, 1600, 2000]` via Astro `Image`.

---

## JavaScript

Client bundle continues to ship GSAP + ScrollTrigger + Lenis + navigation in one module. Reduced-motion and coarse-pointer paths skip Lenis and heavy parallax.

---

## Remaining risks

- Hero video is still a moving image asset; constrained networks will feel it before images.
- Large PNG sources remain in `src/assets/images/` for build-time WebP generation; prefer pre-compressed sources when replacing art.
- No service worker / offline caching.
