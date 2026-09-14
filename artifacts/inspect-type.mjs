import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const url of ['http://localhost:3000', 'https://www.apple.com/macbook-air/']) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  console.log(url, await page.locator('h1').first().evaluate(el => { const s = getComputedStyle(el); return {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,tracking:s.letterSpacing,lineHeight:s.lineHeight}; }));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const {root} = await cdp.send('DOM.getDocument');
  const {nodeId} = await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'h1'});
  console.log(await cdp.send('CSS.getPlatformFontsForNode',{nodeId}));
}
await browser.close();
