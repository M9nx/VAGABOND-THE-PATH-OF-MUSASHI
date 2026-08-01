import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

const PORT = 4323;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'docs', 'refactor', 'screenshots');

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'compact-desktop', width: 1280, height: 720 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 },
];

function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn(`npm run preview -- --port ${PORT}`, {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd(),
    });

    let output = '';
    proc.stdout?.on('data', (data) => {
      output += data.toString();
      if (output.includes('ready in')) {
        resolve(proc);
      }
    });

    proc.stderr?.on('data', (data) => {
      output += data.toString();
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Preview server exited with code ${code}: ${output}`));
      }
    });

    setTimeout(() => {
      if (output.includes('ready in')) {
        resolve(proc);
      } else {
        reject(new Error(`Preview server did not start in time: ${output}`));
      }
    }, 30000);
  });
}

async function waitForLenis(page) {
  await page.waitForFunction(() => {
    return document.documentElement.getAttribute('data-smooth-scroll') === 'true';
  }, { timeout: 5000 });
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

async function checkNavigationOverflow(page) {
  return page.evaluate(() => {
    const nav = document.querySelector('.site-nav__links');
    if (!nav) return false;
    return nav.scrollWidth > nav.clientWidth + 1;
  });
}

async function captureViewport(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  if (viewport.width > 900) {
    await waitForLenis(page).catch(() => {
      // Lenis may be disabled for coarse pointers; acceptable.
    });
  }

  await page.waitForTimeout(1000);

  const overflow = await checkNavigationOverflow(page);
  const errors = await checkConsoleErrors(page);

  const sectionIds = [
    'introduction',
    'chapter-one',
    'chapter-two',
    'chapter-three',
    'chapter-four',
    'chapter-five',
    'chapter-six',
  ];

  for (const id of sectionIds) {
    await page.evaluate((sectionId) => {
      const link = document.querySelector(`a[data-nav-item="${sectionId}"], a[data-mobile-nav-item="${sectionId}"]`);
      if (link instanceof HTMLElement) {
        link.click();
      }
    }, id);
    await page.waitForTimeout(800);
  }

  await page.goto(`${BASE_URL}/#home`);
  await page.waitForTimeout(800);

  await page.screenshot({
    path: join(SCREENSHOT_DIR, `${viewport.name}-${viewport.width}x${viewport.height}.png`),
    fullPage: true,
  });

  return { overflow, errors };
}

async function main() {
  await rm(SCREENSHOT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const preview = await startPreview();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const viewport of viewports) {
    const result = await captureViewport(page, viewport);
    results.push({ viewport: viewport.name, ...result });
  }

  await browser.close();

  // On Windows, killing the shell process does not terminate the child Node process.
  // Use taskkill to destroy the entire process tree.
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' });
    } catch {
      // ignore
    }
  } else {
    preview.kill('SIGTERM');
    setTimeout(() => {
      if (!preview.killed) {
        preview.kill('SIGKILL');
      }
    }, 2000);
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  console.log('\n=== Validation Results ===\n');
  let hasIssues = false;
  for (const result of results) {
    console.log(`${result.viewport}:`);
    console.log(`  Navigation overflow: ${result.overflow ? 'YES' : 'no'}`);
    console.log(`  Console errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
      for (const err of result.errors) {
        console.log(`    - ${err}`);
      }
    }
    if (result.overflow || result.errors.length > 0) {
      hasIssues = true;
    }
  }

  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
  if (hasIssues) {
    console.log('\nSome issues were detected. Please review.');
    process.exit(1);
  } else {
    console.log('\nAll viewports passed validation.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
