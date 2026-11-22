import {launchBrowser,origin} from './browser.mjs';
const browser=await launchBrowser();
try{
  const page=await browser.newPage();
  for(const [name,width,height] of [['social-black',1080,1350],['social-maroon',1080,1350],['social-slate',1080,1350],['packaging-concept',1400,900],['brand-board',1400,1050],['ritual-card',1000,700]]){
    await page.setViewportSize({width,height});await page.goto(`${origin}/brand/${name}.svg`);await page.waitForLoadState('networkidle');await page.screenshot({path:`public/brand/${name}.png`});console.log(`Exported ${name}.png`);
  }
}finally{await browser.close();}
