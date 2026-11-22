import { mkdir,writeFile } from 'node:fs/promises';
import { launchBrowser,origin } from './browser.mjs';
await mkdir('public/images',{recursive:true});
const browser=await launchBrowser();
try{
  const page=await browser.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:1});
  page.on('pageerror',e=>console.error(e));
  await page.goto(`${origin}/?render=1`);await page.waitForFunction(()=>!!window.__studio);
  const save=async(name,state)=>{const data=await page.evaluate(state=>window.__studio.snapshot(state),state);await writeFile(`public/images/${name}.png`,Buffer.from(data.split(',')[1],'base64'));console.log(`Rendered ${name}`);};
  for(const color of ['black','maroon','slate']){
    await save(`${color}-closed`,{color,open:false,view:'cover',spread:0,zoom:1.08});
    await save(`${color}-open`,{color,open:true,view:'paper',spread:0,zoom:1.02});
    for(let spread=1;spread<4;spread++)await save(`${color}-spread-${spread}`,{color,open:true,view:'paper',spread,zoom:1.02});
  }
  await page.setViewportSize({width:1200,height:800});
  await save('collection-open',{color:'slate',open:true,view:'paper',spread:0,zoom:1.1});
  await save('detail',{color:'black',open:false,view:'cover',spread:0,zoom:2.05});
  await page.setViewportSize({width:1100,height:1000});
  await save('pen',{color:'maroon',open:false,view:'pen',zoom:1.23});
}finally{await browser.close();}
