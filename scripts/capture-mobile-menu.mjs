import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const PORT = 4325;
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

function killPreview(preview) {
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' });
    } catch {
      // ignore
    }
  } else {
    preview.kill('SIGKILL');
  }
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const preview = await startPreview();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Open mobile menu.
  const menuButton = await page.$('.site-nav__menu-button');
  await menuButton?.click();
  await page.waitForTimeout(300);

  await page.screenshot({
    path: join(SCREENSHOT_DIR, 'mobile-menu-open-390x844.png'),
    fullPage: false,
  });

  await browser.close();
  killPreview(preview);

  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log('Mobile menu screenshot saved.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
