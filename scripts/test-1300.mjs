import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 4327;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = join(__dirname, '..', 'docs', 'refactor', 'screenshots');

const preview = spawn(`npm run preview -- --port ${PORT}`, {
  stdio: 'pipe',
  shell: true,
  cwd: join(__dirname, '..'),
});

let output = '';
preview.stdout?.on('data', (data) => {
  output += data.toString();
});

preview.stderr?.on('data', (data) => {
  output += data.toString();
});

function kill() {
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' });
    } catch {}
  } else {
    preview.kill('SIGKILL');
  }
}

async function run() {
  await new Promise((resolve, reject) => {
    const check = setInterval(() => {
      if (output.includes('ready in')) {
        clearInterval(check);
        resolve();
      }
    }, 100);
    setTimeout(() => reject(new Error('Preview timeout')), 30000);
  });

  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1300, height: 720 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const header = await page.$('.site-header');
  await header?.screenshot({ path: join(SCREENSHOT_DIR, 'header-1300x720.png') });

  const overflow = await page.evaluate(() => {
    const nav = document.querySelector('.site-nav__links');
    return nav ? nav.scrollWidth > nav.clientWidth + 1 : false;
  });

  console.log('Overflow at 1300px:', overflow);

  await browser.close();
  kill();
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

run().catch((err) => {
  console.error(err);
  kill();
  process.exit(1);
});
