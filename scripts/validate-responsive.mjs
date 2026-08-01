import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const PORT = 4335;
const BASE_PATH = '/VAGABOND-THE-PATH-OF-MUSASHI';
const BASE_URL = `http://127.0.0.1:${PORT}${BASE_PATH}/`;
const SCREENSHOT_DIR = join(process.cwd(), 'docs', 'refactor', 'screenshots', 'final');
const MATRIX_PATH = join(process.cwd(), 'docs', 'refactor', 'responsive-validation.md');

const viewports = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x800', width: 360, height: 800 },
  { name: '375x812', width: 375, height: 812 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
  { name: '430x932', width: 430, height: 932 },
  { name: '667x375', width: 667, height: 375 },
  { name: '844x390', width: 844, height: 390 },
  { name: '932x430', width: 932, height: 430 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '820x1180', width: 820, height: 1180 },
  { name: '1024x1366', width: 1024, height: 1366 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1180x820', width: 1180, height: 820 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1536x864', width: 1536, height: 864 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
];

const sectionIds = [
  'home',
  'introduction',
  'chapter-one',
  'chapter-two',
  'chapter-three',
  'chapter-four',
  'chapter-five',
  'chapter-six',
];

function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn(`npm run preview -- --host 127.0.0.1 --port ${PORT}`, {
      stdio: 'pipe',
      shell: true,
    });
    let output = '';
    const onData = (data) => {
      output += data.toString();
      if (/Local/i.test(output)) resolve(proc);
    };
    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
    setTimeout(() => reject(new Error(output || 'preview timeout')), 45000);
  });
}

async function killPreview(proc) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
  } else {
    proc.kill('SIGTERM');
  }
}

async function inspectViewport(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  return page.evaluate((ids) => {
    const overflow = document.documentElement.scrollWidth > window.innerWidth + 12;
    let overflowCulprits = [];
    if (overflow) {
      overflowCulprits = [...document.body.querySelectorAll('*')]
        .filter((el) => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          // Ignore paint clipped by overflow:hidden/clip ancestors for culprit listing noise.
          const rect = el.getBoundingClientRect();
          return rect.right > window.innerWidth + 2 || rect.left < -2;
        })
        .slice(0, 8)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          className: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
          right: Math.round(el.getBoundingClientRect().right),
        }));
    }
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const navLinks = document.querySelector('.site-nav__links');
    const menu = document.querySelector('.site-nav__menu-button');
    const chapterStatus = document.querySelector('.site-nav__chapter');

    const sectionOk = (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      // Section must exist and have content box; allow offscreen because we only load top.
      return rect.width > 0;
    };

    const results = {};
    for (const id of ids) results[id] = sectionOk(id) ? 'PASS' : 'FAIL';

    return {
      overflow: overflow ? 'FAIL' : 'PASS',
      header: header ? 'PASS' : 'FAIL',
      footer: footer ? 'PASS' : 'FAIL',
      hero: results.home,
      intro: results.introduction,
      ch1: results['chapter-one'],
      ch2: results['chapter-two'],
      ch3: results['chapter-three'],
      ch4: results['chapter-four'],
      ch5: results['chapter-five'],
      ch6: results['chapter-six'],
      compactNav:
        navLinks && getComputedStyle(navLinks).display === 'none' &&
        menu && getComputedStyle(menu).display !== 'none' &&
        chapterStatus && getComputedStyle(chapterStatus).display !== 'none',
      desktopNav:
        navLinks && getComputedStyle(navLinks).display !== 'none',
      consoleNote: document.documentElement.getAttribute('data-smooth-scroll'),
      brokenRootVideo: [...document.querySelectorAll('source')].some((s) =>
        (s.getAttribute('src') || '').startsWith('/videos/')
      ),
      overflowCulprits,
    };
  }, sectionIds);
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const preview = await startPreview();
  await new Promise((r) => setTimeout(r, 1200));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const rows = [];
  for (const viewport of viewports) {
    const result = await inspectViewport(page, viewport);
    rows.push({ viewport: viewport.name, ...result });
  }

  // Representative screenshots
  const shots = [
    { file: 'final-mobile-390x844.png', width: 390, height: 844 },
    { file: 'final-mobile-landscape-844x390.png', width: 844, height: 390 },
    { file: 'final-tablet-768x1024.png', width: 768, height: 1024 },
    { file: 'final-compact-1280x720.png', width: 1280, height: 720 },
    { file: 'final-desktop-1440x900.png', width: 1440, height: 900 },
    { file: 'final-large-1920x1080.png', width: 1920, height: 1080 },
  ];

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(SCREENSHOT_DIR, shot.file), fullPage: false });
  }

  // Mobile menu open
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.click('.site-nav__menu-button');
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'final-nav-mobile-open.png'), fullPage: false });

  // Chapter 01 mobile
  await page.goto(`${BASE_URL}#chapter-one`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'final-chapter-01-mobile.png'), fullPage: false });

  // Gallery + footer mobile
  await page.evaluate(() => document.getElementById('chapter-one')?.scrollIntoView());
  await page.waitForTimeout(400);
  const gallery = await page.$('.editorial-gallery');
  if (gallery) await gallery.screenshot({ path: join(SCREENSHOT_DIR, 'final-gallery-mobile.png') });
  const footer = await page.$('.site-footer');
  if (footer) await footer.screenshot({ path: join(SCREENSHOT_DIR, 'final-footer-mobile.png') });

  // Dist asset path check via page sources
  const assetCheck = await page.evaluate(() => {
    const sources = [...document.querySelectorAll('source, img, link[rel="icon"]')].map((el) =>
      el.getAttribute('src') || el.getAttribute('href')
    );
    return {
      sources,
      hasBaseVideos: sources.some((s) => s && /\/VAGABOND-THE-PATH-OF-MUSASHI\/videos\//.test(s)),
      hasBareVideos: sources.some((s) => s === '/videos/musashi-hero.mp4' || s === '/videos/musashi-hero.webm'),
      hasBrokenBaseJoin: sources.some((s) => s && /VAGABOND-THE-PATH-OF-MUSASHI(?!\/)/.test(s)),
    };
  });

  await browser.close();
  await killPreview(preview);

  const lines = [
    '# Responsive Validation Matrix',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Viewport | Header | Hero | Intro | Ch1 | Ch2 | Ch3 | Ch4 | Ch5 | Ch6 | Footer | Overflow |',
    '|----------|--------|------|-------|-----|-----|-----|-----|-----|-----|--------|----------|',
  ];

  let failed = false;
  for (const row of rows) {
    const cells = [
      row.viewport,
      row.header,
      row.hero,
      row.intro,
      row.ch1,
      row.ch2,
      row.ch3,
      row.ch4,
      row.ch5,
      row.ch6,
      row.footer,
      row.overflow,
    ];
    if (cells.slice(1).some((c) => c === 'FAIL')) failed = true;
    lines.push(`| ${cells.join(' | ')} |`);
  }

  lines.push('', '## Navigation mode checks', '');
  for (const row of rows) {
    const mode = row.desktopNav ? 'desktop-links' : row.compactNav ? 'compact' : 'unknown';
    lines.push(`- ${row.viewport}: ${mode}`);
  }

  lines.push('', '## Overflow culprits (failing viewports)', '');
  for (const row of rows) {
    if (row.overflow === 'FAIL') {
      lines.push(`- ${row.viewport}: ${JSON.stringify(row.overflowCulprits || [])}`);
    }
  }

  lines.push('', '## Asset path checks', '');
  lines.push(`- Base-prefixed video sources present: ${assetCheck.hasBaseVideos}`);
  lines.push(`- Bare /videos root paths present: ${assetCheck.hasBareVideos}`);
  lines.push('', '## Console errors', '');
  lines.push(errors.length ? errors.map((e) => `- ${e}`).join('\n') : 'none');

  await writeFile(MATRIX_PATH, `${lines.join('\n')}\n`, 'utf8');

  console.log(lines.join('\n'));
  console.log('\nAsset check:', assetCheck);
  console.log('Console errors:', errors.length ? errors : 'none');

  const realConsoleErrors = errors.filter((e) => !/favicon|og-image/i.test(e));
  if (failed || assetCheck.hasBareVideos || assetCheck.hasBrokenBaseJoin || realConsoleErrors.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
