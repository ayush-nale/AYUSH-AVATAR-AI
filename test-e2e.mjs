import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  
  page.on('request', req => {
    req.continue();
  });
  
  page.on('response', async res => {
    const url = res.url();
    if (res.status() >= 400 && url.includes('supabase')) {
       console.log(`\n--- [NETWORK] SUPABASE ERROR: ${res.status()} on ${url}`);
       try {
         console.log('Body:', await res.text());
       } catch (e) {}
    }
    if (url.includes('/api/chat') && res.request().method() === 'POST') {
      console.log('\n--- [NETWORK] /api/chat RESPONSE ---');
      console.log('Status:', res.status());
      try {
        const text = await res.text();
        console.log('Body:', text.substring(0, 300));
      } catch (e) {
        console.log('Could not read body:', e);
      }
    }
  });

  console.log('Navigating to http://localhost:3000/auth/login...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Filling login form...');
  try {
    const emailField = await page.$('input[type="email"]');
    if (emailField) await emailField.type('test@example.com');
    
    const pwField = await page.$('input[type="password"]');
    if (pwField) await pwField.type('password123');
    
    const submitBtns = await page.$$('button');
    for (const b of submitBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Sign in')) {
        await b.click();
        break;
      }
    }
  } catch(e) {
    console.log("Login form not found or failed.", e);
  }

  console.log('Waiting 5s for redirect/session creation...');
  console.log('Current URL:', page.url());

  // Wait for network to settle
  await new Promise(r => setTimeout(r, 3000));

  await browser.close();
  console.log('Done test.');
})();
