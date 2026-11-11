/* Floater Games: Scramjet service worker. Leave unrelated page requests alone. */
importScripts('/scram/scramjet.all.js');
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
let configPromise;
self.addEventListener('fetch', (event) => {
  const path = new URL(event.request.url).pathname;
  if (!path.startsWith('/scramjet/')) return;
  event.respondWith((async () => {
    try {
      configPromise ||= scramjet.loadConfig().catch(error => { configPromise = null; throw error; });
      await configPromise;
      if (!scramjet.route(event)) return fetch(event.request);
      return await scramjet.fetch(event);
    } catch (error) {
      console.error('[Floater Games SW]', event.request.url, error);
      const message = String(error?.message || error).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      return new Response(`<!doctype html><meta charset="utf-8"><body style="background:#141020;color:white;font:14px system-ui;padding:18px"><h3>Proxy request failed</h3><pre style="white-space:pre-wrap">${message}</pre><p>Check the service worker and BareMux SharedWorker consoles for details.</p></body>`, {status:502,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
    }
  })());
});
