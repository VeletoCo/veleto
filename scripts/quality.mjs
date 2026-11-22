import {launchBrowser,origin} from './browser.mjs';
import assert from 'node:assert/strict';
const b=await launchBrowser();
try{
  const p=await b.newPage({viewport:{width:320,height:950}});p.on('pageerror',e=>console.error(e));
  await p.goto(origin);await p.waitForSelector('.model-ready');await p.waitForTimeout(500);
  const overflow=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&getComputedStyle(e).position!=='absolute';}).map(e=>({tag:e.tagName,class:e.className,id:e.id,right:e.getBoundingClientRect().right})));
  console.log('320px overflow:',overflow);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.screenshot({path:'screenshots/small-phone.png'});
  await p.setViewportSize({width:1440,height:1050});await p.locator('#open-book').click();await p.waitForTimeout(1400);
  await p.locator('#next-page').click();await p.waitForTimeout(220);await p.screenshot({path:'screenshots/page-turn-front.png'});
  await p.waitForTimeout(1100);await p.locator('#next-page').click();await p.waitForTimeout(450);await p.screenshot({path:'screenshots/page-turn-back.png'});
  await p.waitForTimeout(1000);await p.locator('#open-book').click();await p.waitForTimeout(220);await p.screenshot({path:'screenshots/cover-hinge.png'});
  console.log('Saved narrow-phone, page-turn, and cover-hinge screenshots.');
}finally{await b.close();}
