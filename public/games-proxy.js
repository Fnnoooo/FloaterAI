"use strict";
let readyPromise;
window.floaterProxyReady=function(){
 if(readyPromise)return readyPromise;
 readyPromise=(async()=>{
  if(typeof $scramjetLoadController!=="function"||typeof BareMux==="undefined")throw Error("Proxy assets not loaded. Deploy the Node project, not just public/.");
  const {ScramjetController}=$scramjetLoadController();
  const controller=new ScramjetController({files:{wasm:"/scram/scramjet.wasm.wasm",all:"/scram/scramjet.all.js",sync:"/scram/scramjet.sync.js"}});
  await controller.init();await registerSW();
  const connection=new BareMux.BareMuxConnection("/baremux/worker.js");
  await connection.setTransport("/libcurl/index.mjs",[{websocket:"wss://nexus-wisp-worker.lincolnshy62.workers.dev/"}]);
  window.__floaterScramjet=controller;
 })().catch(e=>{readyPromise=null;throw e;});return readyPromise;
};
window.floaterProxyUrl=function(url){if(!window.__floaterScramjet)throw Error("Proxy not initialized");return window.__floaterScramjet.encodeUrl(url);};
