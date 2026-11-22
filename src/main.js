import './atelier.css';
import { setupDrawing } from './drawing.js';
import { submitInterest } from './email.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const colors={black:{name:'Black',swatch:'#252525',paper:'#282928'},maroon:{name:'Maroon',swatch:'#642735',paper:'#57232f'},slate:{name:'Slate',swatch:'#5b6161',paper:'#505657'}};
const spreads=['Architectural studies','An object in mind','Notes to myself','Room for your ideas'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let saved;try{saved=sessionStorage.getItem('veloto-color');}catch{}
let state={color:colors[saved]?saved:'maroon',open:false,spread:0,view:'cover',zoom:1};
let model=null,staticMode=false,failed=false,guide=-1,loadPromise=null;
const shell=$('#viewer-shell');
function announce(message){$('#viewer-status').textContent=message;}
function stopIntro(){$('#drag-hint').style.opacity='0';}
function update(next={}){
  state={...state,...next};const col=colors[state.color];
  document.documentElement.style.setProperty('--paper',col.paper);
  $$('.color-name').forEach(e=>{e.textContent=col.name;});
  $$('[data-color]').forEach(e=>{const selected=e.dataset.color===state.color;e.setAttribute('aria-pressed',String(selected));e.classList.toggle('selected',selected);});
  try{sessionStorage.setItem('veloto-color',state.color);}catch{}
  $('#preferred-color').value=state.color;
  $('#open-book').textContent=`${state.open?'Close':'Open'} the notebook`;
  const names={black:'Still',maroon:'Ember',slate:'Form'};
  const descriptions={black:'For the thoughts that need a little quiet.',maroon:'A warm beginning for your next idea.',slate:'A considered space for a fresh perspective.'};
  $('#selection-description').textContent=`${names[state.color]} / ${col.name} selected. ${descriptions[state.color]}`;
  $('#selected-cta').textContent=`Join the ${col.name} waitlist`;
  ['cover','paper','pen'].forEach(v=>{const e=$(`#view-${v}`);e.classList.toggle('active',state.view===v);e.setAttribute('aria-pressed',String(state.view===v));});
  $('#spread-controls').hidden=!state.open||state.view==='pen';
  $('#prev-page').disabled=state.spread===0;$('#next-page').disabled=state.spread===3;
  $('#spread-label').textContent=`0${state.spread+1} / 04 · ${spreads[state.spread]}`;
  $('#zoom-in').disabled=state.zoom>=1.55||staticMode;$('#zoom-out').disabled=state.zoom<=.75||staticMode;
  $('#rotate-left').disabled=$('#rotate-right').disabled=staticMode;
  const poster=$('#product-poster');poster.src=state.view==='pen'?'/images/pen.png':`/images/${state.color}-${state.open?(state.spread?`spread-${state.spread}`:'open'):'closed'}.png`;
  poster.alt=state.view==='pen'?'White gel-pen concept':`${col.name} notebook concept, ${state.open?'open with white-ink example sketches':'blank matte cover'}`;
  $('#paper-image').src=`/images/${state.color}-open.png`;$('#paper-image').alt=`Open ${col.name.toLowerCase()} concept notebook with white-ink example sketches on matching paper`;
  const suffix=state.view==='pen'?'White-ink pen':state.open?spreads[state.spread]:'Closed cover';
  announce(`${col.name} · ${suffix}${staticMode?' · Static view':''}`);model?.setState(state);
}
$$('[data-swatches]').forEach(list=>{Object.entries(colors).forEach(([key,col])=>{const b=document.createElement('button');b.type='button';b.className='swatch';b.style.setProperty('--swatch',col.swatch);b.dataset.color=key;b.setAttribute('aria-label',`Choose ${col.name}`);b.title=col.name;list.append(b);});});
$$('[data-color]').forEach(b=>b.addEventListener('click',()=>{stopIntro();update({color:b.dataset.color});}));
$('#product-poster').addEventListener('load',e=>{shell.classList.add('has-poster');e.currentTarget.hidden=false;});
function setStatic(enabled,message){staticMode=enabled;shell.classList.toggle('static-mode',enabled);$('#static-view').textContent=enabled?'3D view':'Static view';$('#static-view').setAttribute('aria-pressed',String(enabled));$('#drag-hint').hidden=enabled;update();if(message)announce(message);}
async function loadModel(){
  if(model)return model;if(loadPromise)return loadPromise;
  loadPromise=(async()=>{try{const {createAtelier}=await import('./model.js');model=createAtelier($('#model-mount'),{reduced:reduced.matches,onInteract:stopIntro,onFailure:message=>{failed=true;setStatic(true,message);}});model.setState(state);shell.classList.add('model-ready');return model;}catch(e){failed=true;setStatic(true,'Static viewing is ready. Interactive viewing is unavailable on this device.');console.info('VELOTO static fallback:',e.message);return null;}})();return loadPromise;
}
$('#static-view').addEventListener('click',async()=>{stopIntro();if(staticMode){if(failed){model?.dispose();model=null;loadPromise=null;failed=false;await loadModel();}if(model)setStatic(false);}else setStatic(true);});
function showView(view){stopIntro();update({view,open:view==='paper'?true:view==='cover'?false:state.open});}
$('#open-book').addEventListener('click',()=>{stopIntro();const open=!state.open;update({open,view:open?'paper':'cover'});});
['cover','paper','pen'].forEach(v=>$(`#view-${v}`).addEventListener('click',()=>showView(v)));
$('#prev-page').addEventListener('click',()=>update({spread:Math.max(0,state.spread-1)}));
$('#next-page').addEventListener('click',()=>update({spread:Math.min(3,state.spread+1)}));
$('#zoom-in').addEventListener('click',()=>{stopIntro();update({zoom:Math.min(1.55,state.zoom+.15)});});
$('#zoom-out').addEventListener('click',()=>{stopIntro();update({zoom:Math.max(.75,state.zoom-.15)});});
$('#reset-view').addEventListener('click',()=>{stopIntro();model?.reset();update({zoom:1});});
$('#rotate-left').addEventListener('click',()=>{stopIntro();model?.rotate(-1);});$('#rotate-right').addEventListener('click',()=>{stopIntro();model?.rotate(1);});
// Canvas rotation is also available through the keyboard. Other actions use ordinary buttons.
$('#viewer-stage').tabIndex=0;$('#viewer-stage').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();stopIntro();model?.rotate(e.key==='ArrowLeft'?-1:1);}if(e.key==='Escape')exitGuide();});
function returnToViewer(view){showView(view);$('#viewer-shell').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});$(`#view-${view}`).focus({preventScroll:true});}
$('#explore-paper').addEventListener('click',()=>returnToViewer('paper'));$('#inspect-pen').addEventListener('click',()=>returnToViewer('pen'));
const guideSteps=[{title:'A quiet exterior.',copy:'A completely blank, smooth matte cover. The only thing to add is your own perspective.',view:'cover',zoom:1.15},{title:'Color, all the way through.',copy:'Matching paper, a subtle dot grid, and a lay-flat opening as a design target.',view:'paper',zoom:1},{title:'Leave a white line.',copy:'Original sample sketches show white marks on colored paper. Your pages start with only the dot grid.',view:'paper',zoom:1.15},{title:'The counterpart.',copy:'A minimal white-ink gel pen, included in the proposed set. Final ink performance awaits samples.',view:'pen',zoom:1.2}];
function guideStep(index){guide=index;const s=guideSteps[index];$('#guided-panel').hidden=false;$('#guide-count').textContent=`0${index+1} / 04`;$('#guide-title').textContent=s.title;$('#guide-copy').textContent=s.copy;$('#guide-prev').disabled=index===0;$('#guide-next').textContent=index===3?'Finish':'Next';showView(s.view);update({zoom:s.zoom});}
function exitGuide(){guide=-1;$('#guided-panel').hidden=true;$('#start-guide').focus({preventScroll:true});}
$('#start-guide').addEventListener('click',()=>{guideStep(0);$('#exit-guide').focus({preventScroll:true});});$('#guide-next').addEventListener('click',()=>guide===3?exitGuide():guideStep(guide+1));$('#guide-prev').addEventListener('click',()=>guideStep(Math.max(0,guide-1)));$('#exit-guide').addEventListener('click',exitGuide);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&guide>=0)exitGuide();});
const cleanupDrawing=setupDrawing($('#drawing-canvas'),$('#drawing-placeholder'));
let animation;const demoPath=$('#demo-stroke'),demoButton=$('#demo-play');
function playInk(replay=false){if(replay||!animation){animation?.cancel();animation=demoPath.animate([{strokeDashoffset:650},{strokeDashoffset:0}],{duration:reduced.matches?1:3300,easing:'ease-in-out',fill:'forwards'});animation.onfinish=()=>{demoButton.textContent='Replay';demoButton.setAttribute('aria-label','Replay ink demonstration');};}else if(animation.playState==='running'){animation.pause();demoButton.textContent='Play';demoButton.setAttribute('aria-label','Play ink demonstration');return;}else if(animation.playState==='finished'){playInk(true);return;}else animation.play();demoButton.textContent='Pause';demoButton.setAttribute('aria-label','Pause ink demonstration');}
demoButton.addEventListener('click',()=>playInk());$('#demo-replay').addEventListener('click',()=>playInk(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&animation?.playState==='running'){animation.pause();demoButton.textContent='Play';}});
new IntersectionObserver(([e])=>{if(!e.isIntersecting&&animation?.playState==='running'){animation.pause();demoButton.textContent='Play';}}).observe($('.ink-demo'));
$('#interest-form').addEventListener('submit',async e=>{e.preventDefault();const email=$('#email'),status=$('#form-message'),button=$('#submit-interest');status.classList.remove('form-error');if(!email.validity.valid||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){email.setAttribute('aria-invalid','true');status.textContent='Please enter a valid email address, such as you@example.com.';status.classList.add('form-error');email.focus();return;}email.removeAttribute('aria-invalid');button.disabled=true;button.textContent='Previewing…';try{const r=await submitInterest({email:email.value.trim(),color:$('#preferred-color').value});status.textContent=r.message;email.value='';}catch(error){status.textContent=error.message||'The preview could not finish. Please try again.';status.classList.add('form-error');}finally{button.disabled=false;button.textContent='Join the waitlist';}});
$('#email').addEventListener('input',()=>$('#email').removeAttribute('aria-invalid'));
$('#preferred-color').addEventListener('change',e=>{if(colors[e.target.value])update({color:e.target.value});});
const dialog=$('#privacy-dialog');$('#privacy-button').addEventListener('click',()=>dialog.showModal());$$('.dialog-close').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#year').textContent=new Date().getFullYear();update();
if(new URLSearchParams(location.search).has('render')){
  document.body.innerHTML='<div id="render-mount" style="position:fixed;inset:0"></div>';
  const {createAtelier}=await import('./model.js');const studio=createAtelier($('#render-mount'),{capture:true,reduced:true});window.__studio=studio;
}else{const schedule=window.requestIdleCallback||((fn)=>setTimeout(fn,150));schedule(()=>loadModel(),{timeout:700});}
window.addEventListener('pagehide',()=>{model?.dispose();cleanupDrawing();animation?.cancel();},{once:true});
// Read-only state helps the local browser verification inspect settled UI behavior.
Object.defineProperty(window,'__veloto',{get:()=>({...state,staticMode,guide})});

// Reveal once; keep all content visible without JavaScript or with reduced motion.
if(!new URLSearchParams(location.search).has('render')){
  const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view');revealObserver.unobserve(entry.target);}}},{threshold:.08,rootMargin:'0px 0px 35px 0px'});
  $$('.reveal').forEach(el=>revealObserver.observe(el));
  document.documentElement.classList.add('motion-ready');
  let scrollFrame=0;
  const onScroll=()=>{if(scrollFrame||reduced.matches)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;shell.style.setProperty('--parallax',`${Math.min(scrollY*.055,38)}px`);});};
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('pagehide',()=>{revealObserver.disconnect();removeEventListener('scroll',onScroll);cancelAnimationFrame(scrollFrame);},{once:true});
}
