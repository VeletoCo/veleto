export function setupDrawing(canvas, placeholder) {
  const ctx=canvas.getContext('2d');let strokes=[],current=null,pointerId=null,rect,dpr=1;
  function redraw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,canvas.width/dpr,canvas.height/dpr);ctx.strokeStyle='#fff8ef';ctx.fillStyle='#fff8ef';ctx.lineCap='round';ctx.lineJoin='round';
    for(const stroke of strokes){ctx.lineWidth=stroke.width;ctx.beginPath();stroke.points.forEach((p,i)=>{const x=p.x*rect.width,y=p.y*rect.height;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});if(stroke.points.length===1){const p=stroke.points[0];ctx.arc(p.x*rect.width,p.y*rect.height,stroke.width/2,0,Math.PI*2);ctx.fill();}else ctx.stroke();}
  }
  const resize=()=>{rect=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,3);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);redraw();};
  const ro=new ResizeObserver(resize);ro.observe(canvas);
  const point=e=>({x:Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height))});
  const end=e=>{if(pointerId!==e.pointerId)return;if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);current=null;pointerId=null;};
  canvas.addEventListener('pointerdown',e=>{if(pointerId!==null||e.button!==0)return;rect=canvas.getBoundingClientRect();pointerId=e.pointerId;canvas.setPointerCapture(pointerId);current={width:Number(document.querySelector('[name="line-width"]:checked').value),points:[point(e)]};strokes.push(current);placeholder.style.opacity='0';redraw();e.preventDefault();});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId||!current)return;for(const p of e.getCoalescedEvents?.()||[e])current.points.push(point(p));redraw();e.preventDefault();});
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',()=>{pointerId=null;current=null;});
  document.getElementById('clear-drawing').addEventListener('click',()=>{strokes=[];current=null;placeholder.style.opacity='1';redraw();});
  resize();return ()=>ro.disconnect();
}
