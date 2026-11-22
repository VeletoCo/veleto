import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {launchBrowser,origin} from '../scripts/browser.mjs';
const content=JSON.parse((await readFile('public/launch-kit/content.json','utf8')).replace(/^\uFEFF/,''));
for(const [key,count] of Object.entries({reels:10,captions:10,scripts:5,announcements:3,outreach:3,calendar:30}))assert.equal(content[key].length,count,key);
const operations=JSON.parse((await readFile('public/launch-kit/operations.json','utf8')).replace(/^\uFEFF/,''));
assert.equal(operations.funnel.launchEmails.length,3);
assert.deepEqual(operations.plan.unitEconomics.pilotTable.map(row=>row[0]),[25,50,100,300]);
assert.equal(operations.plan.validationCosts.reduce((sum,row)=>sum+row[1],0),300);
assert.equal(operations.plan.validationCosts.reduce((sum,row)=>sum+row[2],0),800);
const browser=await launchBrowser();const errors=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin);await page.waitForSelector('.model-ready');
  await page.locator('.collection-item[data-color="black"]').click();
  assert.match(await page.locator('#selected-cta').textContent(),/Black/);
  await page.locator('#selected-cta').click();assert.equal(await page.locator('#preferred-color').inputValue(),'black');
  await page.locator('#preferred-color').selectOption('slate');
  assert.equal((await page.evaluate(()=>window.__veloto)).color,'slate');
  await page.locator('#submit-interest').click();assert.equal(await page.locator('#email').getAttribute('aria-invalid'),'true');
  await page.locator('#email').fill('test@example.com');await page.locator('#submit-interest').click();
  await page.waitForFunction(()=>document.querySelector('#form-message').textContent.includes('not sent or saved'));
  assert.equal(await page.locator('#submit-interest').textContent(),'Join the waitlist');
  await page.goto(`${origin}/launch-kit/`);
  assert.equal(await page.locator('main>section').count(),6);
  assert.match(await page.locator('#plan').textContent(),/Customer pays \$5 shipping/);
  assert.match(await page.locator('#plan').textContent(),/Free \$5 shipping/);
  assert.match(await page.locator('#plan').textContent(),/\$365\.01/);
  const check=page.locator('[data-check="approval-0"]');await check.check();await page.reload();assert.equal(await check.isChecked(),true);await check.uncheck();
  const downloads=await page.locator('a[download]').evaluateAll(links=>links.map(a=>a.href));
  for(const url of downloads){const response=await page.request.get(url);assert.equal(response.status(),200,url);assert.ok((await response.body()).length>0,url);if(!url.endsWith('.svg'))assert.ok(!response.headers()['content-type']?.includes('text/html'),`missing download ${url}`);}
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:950});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`kit overflow ${width}`);}
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'screenshots/launch-kit.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: asset counts, cost totals, shade-to-waitlist flow, demo states, calculator, checklist persistence, all downloads, responsive kit, and no page errors.');
}finally{await browser.close();}
