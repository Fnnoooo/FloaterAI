FLOATER AI - NETLIFY GITHUB DEPLOY

1. Upload the CONTENTS of this ZIP to a NEW GitHub repository.
2. In Netlify choose Add new project > Import an existing project > GitHub.
3. Choose this repository. Netlify will use netlify.toml to run npm run build and publish public/.
4. Deploy. Open the Netlify HTTPS URL (not the downloaded HTML file).
5. Open Floater PiP and search a game.

This is NOT a drag-and-drop static ZIP. The npm build must run to generate Scramjet, BareMux and Libcurl assets.

Search-by-name is limited to the built-in directory until a SEARXNG_URL environment variable is configured in Netlify. Direct game URLs work without search provider.

Wisp endpoint is configured to Cloudflare Worker root /; compatibility has not been verified. Some games or PiP behaviors may be blocked by browser limitations.

Original NEXUS Hub is untouched.
