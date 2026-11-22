// Replace this adapter with a call to a server endpoint when a provider is ready.
// Provider credentials must live on that server, never in a VITE_ variable.
export async function submitInterest({ email, color }, { signal } = {}) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  await new Promise((resolve,reject)=>{const t=setTimeout(resolve,450);signal?.addEventListener('abort',()=>{clearTimeout(t);reject(new DOMException('Aborted','AbortError'));},{once:true});});
  return { mode:'demo', message:'Demo complete. Your email was not sent or saved, and you have not been subscribed.' };
}
