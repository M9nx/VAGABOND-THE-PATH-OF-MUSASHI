import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const PORT = 4330;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'docs', 'refactor', 'screenshots');

function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn(`npm run preview -- --host 127.0.0.1 --port ${PORT}`, {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd(),
    });

    let output = '';
    const onData = (data) => {
      output += data.toString();
      if (/Local/i.test(output) || /ready in/i.test(output)) {
        resolve(proc);
      }
    };

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
    proc.on('error', reject);
    setTimeout(() => reject(new Error(`Preview did not start:\n${output}`)), 45000);
  });
}

async function killPreview(proc) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
  } else {
    proc.kill('SIGTERM');
  }
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const preview = await startPreview();
  await new Promise((r) => setTimeout(r, 1500));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  // Measure overflow across widths with forced desktop nav visibility.
  const measureWidths = [1920, 1600, 1440, 1400, 1366, 1360, 1320, 1280, 1180, 1024];
  const overflowResults = [];

  for (const width of measureWidths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const result = await page.evaluate(() => {
      const nav = document.querySelector('.site-nav__links');
      const chapter = document.querySelector('.site-nav__chapter');
      const menu = document.querySelector('.site-nav__menu-button');
      const linksVisible = !!nav && getComputedStyle(nav).display !== 'none';
      const chapterVisible = !!chapter && getComputedStyle(chapter).display !== 'none';
      const menuVisible = !!menu && getComputedStyle(menu).display !== 'none';
      const overflow = linksVisible
        ? nav.scrollWidth > nav.clientWidth + 1
        : false;

      const linkBoxes = linksVisible
        ? [...nav.querySelectorAll('.site-nav__link')].map((link) => {
            const rect = link.getBoundingClientRect();
            const label = link.querySelector('.site-nav__link-label');
            const number = link.querySelector('.site-nav__link-number');
            const labelRect = label?.getBoundingClientRect();
            const numberRect = number?.getBoundingClientRect();
            const overlap =
              numberRect && labelRect
                ? numberRect.right > labelRect.left + 1 &&
                  numberRect.left < labelRect.right - 1 &&
                  numberRect.bottom > labelRect.top + 1 &&
                  numberRect.top < labelRect.bottom - 1
                : false;
            return {
              text: link.textContent?.replace(/\s+/g, ' ').trim(),
              width: Math.round(rect.width),
              wrap: label ? getComputedStyle(label).whiteSpace !== 'nowrap' : null,
              overlap,
            };
          })
        : [];

      const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;

      return {
        linksVisible,
        chapterVisible,
        menuVisible,
        overflow,
        horizontalOverflow,
        linkBoxes,
        active: document.querySelector('[data-nav-item][aria-current="location"]')?.getAttribute('data-nav-item')
          ?? document.querySelector('[data-mobile-nav-item][aria-current="location"]')?.getAttribute('data-mobile-nav-item'),
        smooth: document.documentElement.getAttribute('data-smooth-scroll'),
      };
    });

    overflowResults.push({ width, ...result });
  }

  // Capture required header + page screenshots.
  const shots = [
    { name: 'header-tablet-1024x768', width: 1024, height: 768, headerOnly: true },
    { name: 'header-compact-desktop-1280x720', width: 1280, height: 720, headerOnly: true },
    { name: 'header-desktop-1440x900', width: 1440, height: 900, headerOnly: true, activate: 'introduction' },
    { name: 'header-large-desktop-1920x1080', width: 1920, height: 1080, headerOnly: true, activate: 'introduction' },
    { name: 'header-mobile-390x844', width: 390, height: 844, headerOnly: true },
    { name: 'tablet-1024x768', width: 1024, height: 768, headerOnly: false },
    { name: 'compact-desktop-1280x720', width: 1280, height: 720, headerOnly: false },
    { name: 'desktop-1440x900', width: 1440, height: 900, headerOnly: false },
    { name: 'mobile-390x844', width: 390, height: 844, headerOnly: false },
  ];

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);

    if (shot.activate) {
      const selector = shot.width > 1360
        ? `a[data-nav-item="${shot.activate}"]`
        : `a[data-mobile-nav-item="${shot.activate}"]`;

      if (shot.width <= 1360) {
        await page.click('.site-nav__menu-button');
        await page.waitForTimeout(300);
      }

      await page.click(selector);
      await page.waitForTimeout(1800);

      if (shot.width <= 1360) {
        // Menu should close after link click.
        await page.waitForTimeout(200);
      }
    }

    if (shot.headerOnly) {
      const header = await page.$('.site-header');
      if (header) {
        await header.screenshot({ path: join(SCREENSHOT_DIR, `${shot.name}.png`) });
      }
    } else {
      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${shot.name}.png`),
        fullPage: false,
      });
    }
  }

  // Anchor landing check at 1440.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const anchorResults = [];
  for (const id of ['introduction', 'chapter-one', 'chapter-three', 'chapter-six']) {
    await page.click(`a[data-nav-item="${id}"]`);
    await page.waitForTimeout(2000);
    const metrics = await page.evaluate((sectionId) => {
      const header = document.querySelector('.site-header');
      const section = document.getElementById(sectionId);
      if (!header || !section) return null;
      const headerBottom = header.getBoundingClientRect().bottom;
      const sectionTop = section.getBoundingClientRect().top;
      return {
        sectionId,
        headerBottom: Math.round(headerBottom),
        sectionTop: Math.round(sectionTop),
        clearOfHeader: sectionTop >= headerBottom - 4,
        active: document.querySelector('[data-nav-item][aria-current="location"]')?.getAttribute('data-nav-item'),
        expectedOffset: Math.round(headerBottom + 16),
      };
    }, id);
    anchorResults.push(metrics);
  }

  // Reduced motion: Lenis off.
  const reducedPage = await browser.newPage({ reducedMotion: 'reduce' });
  await reducedPage.setViewportSize({ width: 1440, height: 900 });
  await reducedPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await reducedPage.waitForTimeout(500);
  const reducedMotionState = await reducedPage.evaluate(() => ({
    smooth: document.documentElement.getAttribute('data-smooth-scroll'),
  }));
  await reducedPage.close();

  await browser.close();
  await killPreview(preview);

  console.log('\n=== Overflow sweep ===');
  for (const row of overflowResults) {
    console.log(
      `${row.width}px | links:${row.linksVisible ? 'yes' : 'no'} status:${row.chapterVisible ? 'yes' : 'no'} menu:${row.menuVisible ? 'yes' : 'no'} overflow:${row.overflow ? 'YES' : 'no'} h-scroll:${row.horizontalOverflow ? 'YES' : 'no'} smooth:${row.smooth} active:${row.active}`
    );
    if (row.linkBoxes?.some((b) => b.overlap)) {
      console.log('  LINK OVERLAP DETECTED', row.linkBoxes.filter((b) => b.overlap));
    }
  }

  console.log('\n=== Anchor landings ===');
  console.log(JSON.stringify(anchorResults, null, 2));

  console.log('\n=== Reduced motion ===');
  console.log(reducedMotionState);

  console.log('\n=== Console errors ===');
  console.log(consoleErrors.length ? consoleErrors : 'none');

  const desktopOverflow = overflowResults.filter((r) => r.linksVisible && r.overflow);
  const badAnchors = anchorResults.filter(
    (r) => !r || !r.clearOfHeader || r.active !== r.sectionId
  );
  const hScroll = overflowResults.filter((r) => r.horizontalOverflow);

  if (desktopOverflow.length || consoleErrors.length || badAnchors.length) {
    console.log('\nFAILED validation');
    if (badAnchors.length) console.log('Bad anchors:', badAnchors);
    if (hScroll.length) console.log('Horizontal overflow widths:', hScroll.map((r) => r.width));
    process.exit(1);
  }

  if (hScroll.length) {
    console.log('\nWARNING: horizontal overflow at', hScroll.map((r) => r.width));
  }

  console.log('\nPASSED validation');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
