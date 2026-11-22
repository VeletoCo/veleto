import { launchBrowser, origin } from './browser.mjs';
const browser=await launchBrowser();
try {
  const page=await browser.newPage({viewport:{width:1440,height:1050}});
  await page.goto(origin);await page.waitForSelector('.model-ready');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
  await page.screenshot({path:'screenshots/current-desktop.png'});
  await page.locator('#collection').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
  await page.screenshot({path:'screenshots/current-collection.png'});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
  await page.screenshot({path:'screenshots/current-mobile.png'});
  console.log('Preview screenshots saved.');
} finally {await browser.close();}
