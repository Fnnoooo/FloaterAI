FLOATER AI V17 + GAMES PICTURE-IN-PICTURE (TEST)

This is a Node.js project, NOT a static Netlify drag-and-drop ZIP.
Deploy to a Node host that runs `npm install` and `npm start`, or run locally with Node 20+.
Your Cloudflare Wisp endpoint is configured in public/games-proxy.js.

For broad game-name search, set SEARXNG_URL to a working SearXNG instance that allows JSON responses.
Without it, search supports known game names and full website URLs, but is not a full web search engine.

On the calculator enter 0003 =. Click Share Chrome Tab to open the floating window, then Games.
The AI and capture-first PiP workflow from V17 are preserved.

Limitations: Document PiP requires recent desktop Chrome/Edge, proxy compatibility varies by game, and Workers Wisp TCP and bandwidth limits may affect loading. Browser keyboard focus, pointer lock and gamepad support can vary in PiP.

The proxy server's /scram/, /baremux/, and /libcurl/ assets are served from the original NEXUS backend packages, but NEXUS UI and games are NOT included in this project.
