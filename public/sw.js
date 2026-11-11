importScripts('/scram/scramjet.all.js');
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const isProxy = new URL(event.request.url).pathname.startsWith('/scramjet/');
    try {
      await scramjet.loadConfig();
      if (!scramjet.route(event)) return fetch(event.request);
      // Prevent an indefinitely blank iframe if the upstream Wisp TCP stream stalls.
      // This is a diagnostic failure page, not a replacement for fixing Wisp.
      const response = await Promise.race([
        scramjet.fetch(event),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Proxy upstream timed out after 20 seconds')), 20000))
      ]);
      return response;
    } catch (error) {
      console.error('[Floater Scramjet]', event.request.url, error);
      if (!isProxy) return Response.error();
      const message = String(error?.message || error).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#141020;color:#f5edff;font:14px system-ui;padding:18px"><h3>Game proxy request failed</h3><p>${message}</p><p>The Cloudflare WebSocket can connect, but the website request did not complete. Check the Wisp server's outbound TCP support and Libcurl transport.</p></body>`, {status: 502, headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
    }
  })());
});
