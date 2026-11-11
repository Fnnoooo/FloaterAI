import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));

// Wisp Configuration: Refer to the documentation at https://www.npmjs.com/package/@mercuryworkshop/wisp-js

logging.set_level(logging.NONE);
Object.assign(wisp.options, {
	allow_udp_streams: false,
	hostname_blacklist: [/example\.com/],
	dns_servers: ["1.1.1.3", "1.0.0.3"],
});

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
				else socket.end();
			});
	},
});

fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

fastify.register(fastifyStatic, {
	root: scramjetPath,
	prefix: "/scram/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: libcurlPath,
	prefix: "/libcurl/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});


const gameDirectory = [
 {title:"2v2.io",url:"https://2v2.io/"},{title:"FallZone.io",url:"https://fallzone.io/"},
 {title:"Slope",url:"https://slopegame.io/"},{title:"Shell Shockers",url:"https://shellshock.io/"},
 {title:"Krunker",url:"https://krunker.io/"},{title:"Smash Karts",url:"https://smashkarts.io/"},
 {title:"Bloxd.io",url:"https://bloxd.io/"},{title:"Tetr.io",url:"https://tetr.io/"},
 {title:"Agar.io",url:"https://agar.io/"},{title:"Slither.io",url:"https://slither.io/"},
 {title:"CrazyGames",url:"https://www.crazygames.com/"},{title:"Poki",url:"https://poki.com/"}
];
fastify.get("/api/game-search",async(request,reply)=>{
 const q=String(request.query?.q||"").trim().slice(0,120);
 if(!q)return {results:[]};
 const results=[];const seen=new Set();
 const add=(title,url)=>{try{const u=new URL(url);if(!["https:","http:"].includes(u.protocol))return;if(seen.has(u.href))return;seen.add(u.href);results.push({title:String(title).slice(0,120),url:u.href});}catch{}};
 if(/^https?:\/\//i.test(q))add(q,q);
 else if(/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(q))add(q,"https://"+q);
 for(const game of gameDirectory)if(game.title.toLowerCase().includes(q.toLowerCase())||q.toLowerCase().includes(game.title.toLowerCase()))add(game.title,game.url);
 const endpoint=process.env.SEARXNG_URL;
 if(endpoint){try{
  const u=new URL(endpoint);u.searchParams.set("q",q+" browser game play online");u.searchParams.set("format","json");
  const r=await fetch(u,{signal:AbortSignal.timeout(6500),headers:{Accept:"application/json"}});
  if(r.ok){const data=await r.json();for(const item of (data.results||[]).slice(0,12))add(item.title||item.url,item.url);}
 }catch(e){request.log.warn("Game search provider unavailable: "+e.message);}}
 return {results:results.slice(0,15),note:endpoint?"Search provider enabled.":"Showing built-in matches. Set SEARXNG_URL for broader name searches."};
});

fastify.setNotFoundHandler((res, reply) => {
	return reply.code(404).type("text/html").sendFile("404.html");
});

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	fastify.close();
	process.exit(0);
}

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
