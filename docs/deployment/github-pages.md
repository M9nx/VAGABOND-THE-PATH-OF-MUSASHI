# GitHub Pages Deployment

## Production URL

https://M9nx.github.io/Vagabond-Landing-Page/

## Repository type

Project Pages site (not `username.github.io`).

| Item | Value |
|------|-------|
| GitHub user | `M9nx` |
| Repository | `Vagabond-Landing-Page` |
| Default branch | `main` |
| Astro `site` | `https://M9nx.github.io` |
| Astro `base` | `/Vagabond-Landing-Page` |
| Workflow | `.github/workflows/deploy-pages.yml` |

## How deployment works

1. Push to `main` (or run **Actions → Deploy Astro to GitHub Pages → Run workflow**).
2. The `build` job runs `npm ci`, `npm run "astro check"`, then the official `withastro/action` build/upload.
3. The `deploy` job publishes the Pages artifact with `actions/deploy-pages`.

Pull requests use `.github/workflows/quality.yml` (check + build only — no production deploy).

## Required repository setting

GitHub → **Settings** → **Pages** → **Build and deployment** → **Source** → **GitHub Actions**.

Do not use the older “Deploy from a branch” / `gh-pages` branch flow.

## Asset base paths

Public assets must respect Astro’s `base`:

- Correct: `/Vagabond-Landing-Page/videos/musashi-hero.mp4`
- Incorrect: `/videos/musashi-hero.mp4` (404 on project Pages)

In components, use `import.meta.env.BASE_URL` (includes trailing slash). Hash-only links such as `#chapter-three` stay unprefixed.

Local development continues to work; Astro serves the site under the configured base locally as well (`/Vagabond-Landing-Page/`).

## Inspecting failed deployments

1. Open the repository **Actions** tab.
2. Select the failed **Deploy Astro to GitHub Pages** run.
3. Check whether failure happened in **Astro check**, **build**, or **deploy**.
4. Fix locally with `npm run "astro check"` and `npm run build`, then push again.

## Manual redeploy

Actions → **Deploy Astro to GitHub Pages** → **Run workflow**.

## Custom domain later

1. Add a `CNAME` file under `public/` with the domain name, or configure DNS + Pages custom domain in Settings.
2. Keep `site` in `astro.config.mjs` aligned with the final origin.
3. For a root custom domain, `base` may become `/`; for a path-based project site, keep `/Vagabond-Landing-Page`.

## Rollback

- Revert the bad commit on `main` and push, or re-run a previous successful workflow if GitHub still retains the artifact/history you need.
- Pages always serves the latest successful deployment from the configured Actions source.

## Local production verification

```bash
npm ci
npm run "astro check"
npm run build
npm run preview
```

Open the printed local URL including the `/Vagabond-Landing-Page/` base path.
