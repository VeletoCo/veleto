document.querySelectorAll('.copy').forEach(button=>button.addEventListener('click',async()=>{
  const text=button.closest('.draft').querySelector('pre').textContent;
  try{await navigator.clipboard.writeText(text);button.textContent='Copied';}
  catch{const range=document.createRange();range.selectNodeContents(button.closest('.draft').querySelector('pre'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Text selected — copy manually';}
  setTimeout(()=>button.textContent='Copy text',2500);
}));
document.querySelectorAll('[data-check]').forEach(input=>{
  try{input.checked=localStorage.getItem(`veleto-${input.dataset.check}`)==='true';}catch{}
  input.addEventListener('change',()=>{try{localStorage.setItem(`veleto-${input.dataset.check}`,String(input.checked));}catch{}});
});
function calculate(){
  const ids=['price','landed','cac','shipping'];
  if(ids.some(id=>!document.getElementById(id).validity.valid)){document.getElementById('margin').textContent='Enter a non-negative amount in every field.';return;}
  const [price,landed,cac,shipping]=ids.map(id=>Number(document.getElementById(id).value));
  const before=price-landed-(price*.03+.3)-2-price*.03-shipping,after=before-cac;
  document.getElementById('margin').textContent=`Contribution before acquisition: $${before.toFixed(2)} per set. After acquisition: $${after.toFixed(2)} per set. ${after<0?'This scenario loses money on each order before fixed costs.':'Fixed costs and founder labor are still excluded.'}`;
}
const economics=document.getElementById('economics');
if(economics){economics.addEventListener('input',calculate);economics.addEventListener('submit',e=>e.preventDefault());calculate();}
