import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const LIVE = 'https://m9nx.github.io/VAGABOND-THE-PATH-OF-MUSASHI/';
const DIR = join(process.cwd(), 'docs', 'refactor', 'screenshots', 'final');
await mkdir(DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const failed = [];

page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
});

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(LIVE, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

const desktop = await page.evaluate(() => ({
  title: document.title,
  smooth: document.documentElement.getAttribute('data-smooth-scroll'),
  hasNav: !!document.querySelector('.site-nav'),
  videoSrc: [...document.querySelectorAll('source')].map((s) => s.src),
  cssOk: [...document.styleSheets].length > 0,
  overflow: document.documentElement.scrollWidth > window.innerWidth + 12,
}));

await page.screenshot({
  path: join(DIR, 'github-pages-live-desktop.png'),
  fullPage: false,
});

await page.goto(`${LIVE}#chapter-three`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);

const hash = await page.evaluate(() => ({
  hash: location.hash,
  active:
    document.querySelector('[data-nav-item][aria-current="location"]')?.getAttribute('data-nav-item') ||
    document
      .querySelector('[data-mobile-nav-item][aria-current="location"]')
      ?.getAttribute('data-mobile-nav-item'),
  sectionTop: Math.round(document.getElementById('chapter-three')?.getBoundingClientRect().top ?? -1),
  headerBottom: Math.round(document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? -1),
}));

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(LIVE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.click('.site-nav__menu-button');
await page.waitForTimeout(400);

const mobile = await page.evaluate(() => ({
  menuOpen: document.getElementById('mobile-nav')?.classList.contains('is-open'),
  ariaExpanded: document.querySelector('.site-nav__menu-button')?.getAttribute('aria-expanded'),
}));

await page.screenshot({
  path: join(DIR, 'github-pages-live-mobile.png'),
  fullPage: false,
});

console.log(
  JSON.stringify(
    {
      desktop,
      hash,
      mobile,
      errors,
      failed: failed.slice(0, 20),
      failedCount: failed.length,
    },
    null,
    2
  )
);

await browser.close();

if (errors.length || failed.length || !desktop.hasNav || desktop.overflow) {
  process.exit(1);
}
