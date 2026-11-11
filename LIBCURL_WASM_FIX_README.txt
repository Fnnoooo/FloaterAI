FLOATER AI - LIBCURL WASM STARTUP FIX

Observed error: "wasm not loaded yet, please call libcurl.load_wasm first"

Root cause in the uploaded libcurl/index.mjs (libcurl-transport 1.5.x):
LibcurlClient.init() calls new libcurl.HTTPSession() before waiting for the
WebAssembly runtime to initialize. HTTPSession checks wasm_ready and throws.

Fix: scripts/build.mjs now patches the copied public/libcurl/index.mjs to
await libcurl.load_wasm() before constructing HTTPSession. The script fails
loudly if the upstream library structure changes rather than silently
publishing a broken patch.

IMPORTANT: The ZIP contains SOURCE, not prebuilt static assets.
On a computer with Node 22 and internet access:
  npm install
  npm run build
Then deploy the contents of public/ as your Netlify manual deploy.
For Git-based Netlify builds, netlify.toml already runs npm run build.

Do not manually deploy the unbuilt public/ folder. It lacks scram, libcurl,
and baremux assets until the build runs.

This fixes the specific initialization error. It does not guarantee every
external game works: Wisp endpoint reachability, WebSockets, browser security
restrictions, and Scramjet compatibility can cause separate issues.

Floater AI page design, AI provider, screen sharing, PiP flow, and Games UI
are not modified by this patch.
