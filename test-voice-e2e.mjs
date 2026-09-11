import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true, args: ['--use-fake-ui-for-media-stream'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));

  console.log("Navigating to localhost:3000...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  console.log("Clicking microphone button to start Live Voice...");
  const buttons = await page.$$('button');
  // Find the button that triggers Voice Mode. It probably has a Mic icon.
  // We can just click the first button that has no text or has "Voice" in it.
  // Actually, we'll click the mic button on the dashboard.
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const micBtn = btns.find(b => b.innerHTML.includes('lucide-mic') || b.className.includes('rounded-full'));
    if (micBtn) {
       console.log("Found mic button, clicking...");
       micBtn.click();
    } else {
       console.log("No mic button found.");
    }
  });

  await new Promise(r => setTimeout(r, 6000));
  
  console.log("Closing browser.");
  await browser.close();
})();
