import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Expose function to log from browser context
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Navigate to localhost:3000 to test Next.js directly
  console.log('Navigating to local Dashboard...');
  await page.goto('http://localhost:3000/test-voice.html', { waitUntil: 'networkidle0' });

  await page.click('#btn');
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
})();
