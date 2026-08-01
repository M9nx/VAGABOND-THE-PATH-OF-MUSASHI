import { chromium } from '@playwright/test';
import { spawn } from 'child_process';

const PORT = 4331;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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
    setTimeout(() => reject(new Error(output)), 30000);
  });
}

const preview = await startPreview();
await new Promise((r) => setTimeout(r, 1000));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE_URL, { waitUntil: 'networkidle' });
await page.click('a[data-nav-item="introduction"]');
await page.waitForTimeout(1800);

const info = await page.evaluate(() => {
  const links = [...document.querySelectorAll('.site-nav__link')].map((a) => ({
    text: a.textContent.replace(/\s+/g, ' ').trim(),
    current: a.getAttribute('aria-current'),
    numberCount: a.querySelectorAll('.site-nav__link-number').length,
  }));
  const chapter = document.querySelector('.site-nav__chapter');
  const zeros = [...document.querySelectorAll('.site-header *')].filter((el) =>
    /^\s*00\s*$/.test(el.textContent || '')
  );
  return {
    links,
    chapterDisplay: chapter ? getComputedStyle(chapter).display : null,
    chapterText: chapter?.textContent?.replace(/\s+/g, ' ').trim(),
    zeroTextNodes: zeros.map((el) => ({
      tag: el.tagName,
      className: el.className,
      display: getComputedStyle(el).display,
      text: el.textContent.trim(),
    })),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' });
