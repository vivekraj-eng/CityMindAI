const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
];

let executablePath = '';
for (const p of CHROME_PATHS) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

const routes = [
  '/',
  '/reports',
  '/analytics',
  '/workspace',
  '/profile'
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const logs = [];

  page.on('console', msg => {
    logs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    logs.push(`[CRASH ERROR] ${err.toString()}`);
    console.error('[BROWSER CRASH]', err);
  });

  for (const route of routes) {
    const url = `http://localhost:5175${route}`;
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
      logs.push(`Successfully loaded route: ${route}`);
    } catch (err) {
      console.error(`Failed to load route ${route}:`, err.message);
      logs.push(`Failed route ${route}: ${err.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'diagnostic_report.txt'), logs.join('\n'));
  await browser.close();
  console.log("All routes checked.");
})();
