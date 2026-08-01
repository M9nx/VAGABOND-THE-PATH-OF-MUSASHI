import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

const PORT = 4324;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(process.cwd(), 'docs', 'refactor', 'screenshots');

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

async function main() {
  await rm(SCREENSHOT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const preview = await startPreview();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'compact-desktop', width: 1280, height: 720 },
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'large-desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Screenshot just the header area.
    const header = await page.$('.site-header');
    if (header) {
      await header.screenshot({
        path: join(SCREENSHOT_DIR, `header-${viewport.name}-${viewport.width}x${viewport.height}.png`),
      });
    }

    // Also screenshot the full page for context.
    await page.screenshot({
      path: join(SCREENSHOT_DIR, `${viewport.name}-${viewport.width}x${viewport.height}.png`),
      fullPage: true,
    });
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

  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
