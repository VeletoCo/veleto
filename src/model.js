import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const palette = {
  black: { cover: '#141414', paper: '#191a19', edge: '#121312', ribbon: '#171717' },
  maroon: { cover: '#400d19', paper: '#3a131e', edge: '#310c16', ribbon: '#420c1b' },
  slate: { cover: '#363e40', paper: '#343c3e', edge: '#2c3436', ribbon: '#333b3d' },
};
const W = 2.4, H = 3.5, TOP = .333;
const clamp = THREE.MathUtils.clamp;

// Original example-use artwork. Transparent textures let the paper material carry color.
function artwork(spread, side) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1088;
  const c = canvas.getContext('2d');
  c.fillStyle = '#ffffff30';
  for (let x = 36; x < 750; x += 24) for (let y = 34; y < 1070; y += 24) { c.beginPath(); c.arc(x, y, .95, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = '#f8f1e5'; c.fillStyle = '#f8f1e5'; c.lineWidth = 2; c.lineCap = 'round';
  const line = (points) => { c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke(); };
  const text = (t,x,y,size=30,italic=false) => { c.font = `${italic?'italic ':''}${size}px ${italic?'Georgia':'sans-serif'}`; c.fillText(t,x,y); };
  if (spread === 0) {
    if (!side) {
      text('A study in space',90,140,39,true); text('01 / FORM & FEELING',93,183,15);
      for(let i=0;i<6;i++) { const x=130+i*25, y=365+i*25; line([[x,780],[x,y],[x+200,y-125],[x+200,655],[x,780]]); line([[x,y],[x+270,y+88],[x+270,780],[x+200,655]]); }
      line([[98,836],[615,836]]); text('leave room for the unexpected.',105,917,24,true);
    } else {
      for(let i=0;i<11;i++){c.beginPath();c.moveTo(105,690+i*10);c.bezierCurveTo(270,730+i*8,390,240+i*19,650,350+i*20);c.stroke();}
      text('a line becomes a place.',113,896,26,true); text('EXPLORATION / 001',113,939,14);
    }
  } else if (spread === 1) {
    if(!side){text('Something worth making.',82,150,34,true);c.strokeRect(170,320,360,390);c.strokeRect(195,345,310,340);line([[170,320],[230,270],[590,270],[530,320]]);line([[590,270],[590,660],[530,710]]);line([[70,810],[625,810]]);text('a small object for daily rituals',96,920,25,true);}
    else{ text('The idea',95,170,47,true); ['simplify the silhouette','find the right balance','make room for a pause'].forEach((t,i)=>{c.strokeRect(100,320+i*90,15,15);text(t,140,335+i*90,24,true);}); c.beginPath();c.ellipse(380,770,190,60,0,0,Math.PI*2);c.stroke();line([[190,770],[380,640],[570,770]]);text('keep going →',415,960,25,true); }
  } else if (spread === 2) {
    if(!side){text('Notes to myself',90,160,43,true);['Take the longer way home.','Notice where the light falls.','','Make something without','knowing what it will become.','','There is room to begin again.'].forEach((t,i)=>text(t,90,310+i*66,30,true));text('Tuesday, somewhere quiet.',90,940,23,true);}
    else{for(let i=0;i<8;i++){c.beginPath();c.arc(385,530,65+i*24,0,Math.PI*2);c.stroke();}text('less noise,',120,895,33,true);text('more room.',120,944,33,true);}
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  return texture;
}

function rounded(w,h,d,r=.055) { return new RoundedBoxGeometry(w,h,d,3,r); }
export function createAtelier(mount, { onFailure=()=>{}, onInteract=()=>{}, reduced=false, capture=false }={}) {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:capture,powerPreference:'low-power'});
  if(!context)throw new Error('Graphics unavailable');
  const constrained=!capture&&(innerWidth<700||(navigator.deviceMemory&&navigator.deviceMemory<=4));
  const renderer = new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,preserveDrawingBuffer:capture,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,constrained?1.5:2)); renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3,3,3,-3,.1,70);
  const pmrem = new THREE.PMREMGenerator(renderer); const room = new RoomEnvironment();
  const env = pmrem.fromScene(room,.08); scene.environment=env.texture; scene.environmentIntensity=.46; room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff9ee,0x514a44,1.2));
  const key = new THREE.DirectionalLight(0xfff5e7,2.1); key.position.set(-4,9,4); key.castShadow=true;
  key.shadow.mapSize.set(constrained?512:1024,constrained?512:1024); Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:25}); key.shadow.bias=-.0003; key.shadow.normalBias=.025; key.shadow.radius=5;key.shadow.blurSamples=constrained?5:12;
  scene.add(key); const fill = new THREE.DirectionalLight(0xffffff,.55); fill.position.set(5,3,-4);scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({color:0x342d27,opacity:.19})); ground.rotation.x=-Math.PI/2;ground.position.y=-.085;ground.receiveShadow=true;scene.add(ground);
  const book = new THREE.Group();scene.add(book);
  const coverMat = new THREE.MeshStandardMaterial({color:palette.maroon.cover,roughness:.88,metalness:0});
  // Fine procedural grain keeps concept surfaces tactile without external textures.
  const grainPixels=new Uint8Array(128*128*4);
  for(let i=0;i<128*128;i++){const v=110+Math.floor((Math.sin(i*12.9898)*43758.5453%1+1)*18);grainPixels.set([v,v,v,255],i*4);}
  const grain=new THREE.DataTexture(grainPixels,128,128);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(9,13);grain.needsUpdate=true;
  coverMat.bumpMap=grain;coverMat.bumpScale=.009;
  const paperMat = new THREE.MeshStandardMaterial({color:palette.maroon.paper,roughness:1,metalness:0});
  const edgeMat = new THREE.MeshStandardMaterial({color:palette.maroon.edge,roughness:.95});
  const ribbonMat = new THREE.MeshStandardMaterial({color:palette.maroon.ribbon,roughness:.85,side:THREE.DoubleSide});
  const mesh = (geometry,material,parent,pos) => {const m=new THREE.Mesh(geometry,material);if(pos)m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  mesh(rounded(W+.09,.09,H+.09,.045),coverMat,book,[W/2,.01,0]);
  const frontPivot = new THREE.Group();frontPivot.position.set(0,.185,0);book.add(frontPivot);
  mesh(rounded(W+.09,.09,H+.09,.045),coverMat,frontPivot,[W/2,.19,0]);
  mesh(rounded(.12,.27,H+.04,.045),coverMat,book,[.015,.155,0]);
  mesh(rounded(W-.06,.24,H-.07,.045),edgeMat,book,[W/2,.177,0]);
  const leftBlock=new THREE.Group();book.add(leftBlock);
  mesh(rounded(W-.06,.24,H-.07,.045),edgeMat,leftBlock,[-W/2,.177,0]);
  // Restrained physical page lines, in the same color family as the paper block.
  const edgeLineMat=new THREE.LineBasicMaterial({color:0xaaa19b,transparent:true,opacity:.10});
  for(let i=0;i<18;i++){
    const y=.068+i*.013;
    const pts=[new THREE.Vector3(.065,y,H/2-.035),new THREE.Vector3(W-.035,y,H/2-.035),new THREE.Vector3(W-.035,y,-H/2+.035)];
    book.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),edgeLineMat));
    const lpts=pts.map(p=>new THREE.Vector3(-p.x,p.y,p.z));leftBlock.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lpts),edgeLineMat));
  }
  const ribbonShape=new THREE.Shape();ribbonShape.moveTo(0,0);ribbonShape.lineTo(.115,0);ribbonShape.lineTo(.115,.72);ribbonShape.lineTo(.055,.685);ribbonShape.lineTo(0,.72);ribbonShape.closePath();
  const ribbon = mesh(new THREE.ShapeGeometry(ribbonShape),ribbonMat,book,[.63,.05,H/2-.04]);ribbon.rotation.x=Math.PI/2;ribbon.rotation.z=.03;
  const textures=Array.from({length:4},(_,i)=>[artwork(i,0),artwork(i,1)]);
  function leafGeometry(left=false) {
    const g=new THREE.PlaneGeometry(W-.09,H-.12,38,28);g.rotateX(-Math.PI/2);g.translate((left?-1:1)*(W-.09)/2,0,0);
    const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),u=Math.abs(x)/(W-.09);p.setY(i,.024*Math.sin(u*Math.PI)-.012*Math.exp(-u*15));}g.computeVertexNormals();return g;
  }
  const leftPage=mesh(leafGeometry(true),paperMat.clone(),book,[0,TOP,0]);
  const rightPage=mesh(leafGeometry(),paperMat.clone(),book,[0,TOP,0]);
  const inkMats=[0,1].map(()=>new THREE.MeshBasicMaterial({map:textures[0][0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide}));
  const leftInk=mesh(leafGeometry(true),inkMats[0],book,[0,TOP+.002,0]);
  const rightInk=mesh(leafGeometry(),inkMats[1],book,[0,TOP+.002,0]);
  leftInk.castShadow=rightInk.castShadow=false;
  // A segmented real leaf, deformed around the gutter on every animation frame.
  const turnGeom=leafGeometry();const base=turnGeom.attributes.position.array.slice();
  const turnPaper=mesh(turnGeom,paperMat.clone(),book,[0,TOP+.009,0]); turnPaper.material.side=THREE.DoubleSide;
  const turnInk=mesh(turnGeom.clone(),new THREE.MeshBasicMaterial({map:textures[0][1],transparent:true,side:THREE.FrontSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),book,[0,TOP+.011,0]);turnInk.castShadow=false;
  const turnBackInk=mesh(turnGeom.clone(),new THREE.MeshBasicMaterial({map:textures[1][0],transparent:true,side:THREE.BackSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),book,[0,TOP+.011,0]);turnBackInk.castShadow=false;
  const backUV=turnBackInk.geometry.attributes.uv;for(let i=0;i<backUV.count;i++)backUV.setX(i,1-backUV.getX(i));
  const pen=new THREE.Group();scene.add(pen);
  const white = new THREE.MeshStandardMaterial({color:'#f8f5eb',roughness:.28,metalness:.06});
  const metal = new THREE.MeshStandardMaterial({color:'#c9cccb',roughness:.24,metalness:.9});
  const seam = new THREE.MeshStandardMaterial({color:'#d0d0ca',roughness:.5,metalness:.2});
  mesh(new THREE.CylinderGeometry(.073,.073,2.9,28),white,pen,[0,0,0]);
  mesh(new THREE.CylinderGeometry(.074,.074,.035,28),seam,pen,[0,-.7,0]);
  mesh(new THREE.CylinderGeometry(.071,.073,.19,28),white,pen,[0,1.54,0]);
  mesh(new THREE.CylinderGeometry(.069,.025,.28,28),metal,pen,[0,-1.59,0]);
  mesh(new THREE.CylinderGeometry(.023,.008,.09,18),metal,pen,[0,-1.775,0]);
  mesh(new THREE.SphereGeometry(.009,12,8),metal,pen,[0,-1.822,0]);
  mesh(rounded(.035,.77,.034,.012),metal,pen,[.091,1.11,0]);
  mesh(rounded(.12,.045,.04,.012),metal,pen,[.038,1.47,0]);
  pen.rotation.set(Math.PI/2,0,-.25);pen.position.set(2,.1,.1);

  let state={color:'maroon',open:false,spread:0,view:'cover',zoom:1};
  let open=0, spread=0, pendingSpread=0, turning=null, viewBlend=0, zoom=1;
  let rotY=reduced?-.25:-.44, targetY=-.25, rotX=0,targetX=0, start=performance.now();
  let raf=0, last=0, active=true, disposed=false, settled=0;
  const targetColor=new THREE.Color();const resize=()=>{const {width,height}=mount.getBoundingClientRect();renderer.setSize(width,height,false);frameCamera(width,height);invalidate();};
  function frameCamera(w=mount.clientWidth,h=mount.clientHeight){const aspect=w/Math.max(h,1);const height=THREE.MathUtils.lerp(4.9,6.0,open);const fit=Math.max(aspect<1.08?1.12:1,THREE.MathUtils.lerp(5.2,6.2,open)/(height*aspect));camera.left=-height*aspect/2*fit;camera.right=height*aspect/2*fit;camera.top=height/2*fit;camera.bottom=-height/2*fit;camera.zoom=zoom;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(mount);
  const visibleObserver=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active)invalidate();},{rootMargin:'120px'});visibleObserver.observe(mount);
  const visibility=()=>{if(!document.hidden)invalidate();};document.addEventListener('visibilitychange',visibility);
  function setState(next,immediate=false){state={...state,...next};pendingSpread=state.spread; if(!state.open){turning=null;spread=pendingSpread;} if(immediate){open=state.open?1:0;spread=pendingSpread;turning=null;viewBlend=state.view==='pen'?1:0;zoom=state.zoom;rotY=targetY;rotX=targetX;}settled=0;invalidate();}
  function invalidate(){if(!raf&&!disposed&&active&&!document.hidden)raf=requestAnimationFrame(tick);}
  function tick(time){raf=0;if(disposed||!active||document.hidden)return;const dt=Math.min((time-last)/1000||.016,.05);last=time;
    const rate=reduced||capture?1:1-Math.exp(-dt*7);
    open=THREE.MathUtils.lerp(open,state.open?1:0,rate*.8);if(Math.abs(open-(state.open?1:0))<.0004)open=state.open?1:0;
    viewBlend=THREE.MathUtils.lerp(viewBlend,state.view==='pen'?1:0,rate);zoom=THREE.MathUtils.lerp(zoom,state.zoom,rate);rotY=THREE.MathUtils.lerp(rotY,targetY,rate);rotX=THREE.MathUtils.lerp(rotX,targetX,rate);
    if(state.open&&open>.95&&!turning&&spread!==pendingSpread){turning={from:spread,to:spread+Math.sign(pendingSpread-spread),t:0};}
    if(turning){turning.t+=reduced||capture?1:dt*1.4;if(turning.t>=1){spread=turning.to;turning=null;}}
    const easeOpen=open*open*(3-2*open);frontPivot.rotation.z=easeOpen*Math.PI;
    leftBlock.visible=leftPage.visible=leftInk.visible=open>.82;
    leftBlock.scale.x=clamp((open-.82)/.18,0,1);leftPage.scale.x=leftInk.scale.x=leftBlock.scale.x;
    book.position.set(-W/2*(1-easeOpen)-viewBlend*8,0,0);book.rotation.set(rotX,rotY,0);
    frontPivot.visible=viewBlend<.999;book.visible=viewBlend<.999;
    const cv=palette[state.color];[coverMat,paperMat,edgeMat,ribbonMat,leftPage.material,rightPage.material,turnPaper.material].forEach((m,i)=>{const col=i===0?cv.cover:i===2?cv.edge:i===3?cv.ribbon:cv.paper;targetColor.set(col);m.color.lerp(targetColor,capture?1:rate);});
    leftInk.material.map=textures[spread][0];rightInk.material.map=textures[turning?turning.to:spread][1];
    if(turning){
      const forward=turning.to>turning.from;const t=turning.t;const angle=(forward?t:1-t)*Math.PI;const pos=turnPaper.geometry.attributes.position;const ipos=turnInk.geometry.attributes.position;const bpos=turnBackInk.geometry.attributes.position;
      turnInk.material.map=textures[forward?turning.from:turning.to][1];
      turnBackInk.material.map=textures[forward?turning.to:turning.from][0];
      if(forward)leftInk.material.map=textures[turning.from][0];else leftInk.material.map=textures[turning.to][0];
      for(let i=0;i<pos.count;i++){const bx=base[i*3],bz=base[i*3+2],u=bx/(W-.09);const bend=Math.sin(Math.PI*t)*Math.sin(u*Math.PI)*.38;const x=bx*Math.cos(angle)-bend*Math.sin(angle);const y=bx*Math.sin(angle)+bend*Math.cos(angle);pos.setXYZ(i,x,y,bz);ipos.setXYZ(i,x,y+.003,bz);bpos.setXYZ(i,x,y+.003,bz);}
      pos.needsUpdate=true;ipos.needsUpdate=true;bpos.needsUpdate=true;turnPaper.geometry.computeVertexNormals();turnInk.geometry.computeVertexNormals();turnBackInk.geometry.computeVertexNormals();
    }
    turnPaper.visible=turnInk.visible=turnBackInk.visible=!!turning&&open>.95;
    pen.visible=true;pen.position.set(THREE.MathUtils.lerp(1.9+open*.9,0,viewBlend),.16,.1);pen.rotation.set(Math.PI/2+rotX,rotY*.6,THREE.MathUtils.lerp(-.25,-.62,viewBlend));
    camera.position.set(THREE.MathUtils.lerp(3.4,1.0,easeOpen)*(1-viewBlend)+viewBlend*2,THREE.MathUtils.lerp(12,13,easeOpen),5.5);camera.lookAt(0,.1,0);frameCamera();
    renderer.render(scene,camera);
    const busy=Math.abs(open-(state.open?1:0))>.001||Math.abs(viewBlend-(state.view==='pen'?1:0))>.001||Math.abs(zoom-state.zoom)>.001||Math.abs(rotY-targetY)>.001||Math.abs(rotX-targetX)>.001||turning||spread!==pendingSpread||settled<70;
    settled++;if(busy)invalidate();
  }
  let pointer=null;
  const down=e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,dragged:false,type:e.pointerType};if(e.pointerType!=='touch')renderer.domElement.setPointerCapture(e.pointerId);onInteract();};
  const move=e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(pointer.type==='touch'&&!pointer.dragged){if(Math.abs(e.clientY-pointer.startY)>Math.abs(e.clientX-pointer.startX)+5){pointer=null;return;}if(Math.abs(e.clientX-pointer.startX)<8)return;pointer.dragged=true;renderer.domElement.setPointerCapture(e.pointerId);}targetY+=dx*.007;targetX=clamp(targetX+dy*.003,-.15,.28);pointer.x=e.clientX;pointer.y=e.clientY;settled=0;invalidate();};
  const up=e=>{if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);pointer=null;};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
  const contextLost=e=>{e.preventDefault();onFailure('The interactive view is unavailable. Static viewing is ready.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  resize();
  return {setState,reset(){targetY=-.25;targetX=0;state.zoom=1;settled=0;invalidate();},rotate(dir){targetY+=dir*.18;settled=0;invalidate();},
    async snapshot(next){setState(next,true);for(let i=0;i<5;i++){await new Promise(requestAnimationFrame);tick(performance.now());}return renderer.domElement.toDataURL('image/png');},
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();visibleObserver.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});textures.flat().forEach(t=>t.dispose());grain.dispose();env.dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
