const games=[['2v2.io','https://2v2.io/'],['FallZone.io','https://fallzone.io/'],['Slope','https://slopegame.io/'],['Shell Shockers','https://shellshock.io/'],['Krunker','https://krunker.io/'],['Smash Karts','https://smashkarts.io/'],['Bloxd.io','https://bloxd.io/'],['Tetr.io','https://tetr.io/'],['Agar.io','https://agar.io/'],['Slither.io','https://slither.io/'],['CrazyGames','https://www.crazygames.com/'],['Poki','https://poki.com/']];
export default async (request)=>{
 const q=(new URL(request.url).searchParams.get('q')||'').trim().slice(0,120);
 const results=[],seen=new Set();
 const add=(title,url)=>{try{const u=new URL(url);if(!['https:','http:'].includes(u.protocol)||seen.has(u.href))return;seen.add(u.href);results.push({title:String(title).slice(0,120),url:u.href});}catch{}};
 if(/^https?:\/\//i.test(q))add(q,q);
 else if(/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(q))add(q,'https://'+q);
 for(const [title,url] of games)if(q&&(title.toLowerCase().includes(q.toLowerCase())||q.toLowerCase().includes(title.toLowerCase())))add(title,url);
 const endpoint=Netlify.env.get('SEARXNG_URL');
 if(q&&endpoint){try{const u=new URL(endpoint);u.searchParams.set('q',q+' browser game play online');u.searchParams.set('format','json');const r=await fetch(u,{signal:AbortSignal.timeout(6500),headers:{Accept:'application/json'}});if(r.ok){const data=await r.json();for(const item of (data.results||[]).slice(0,12))add(item.title||item.url,item.url);}}catch{}}
 return Response.json({results:results.slice(0,15),note:endpoint?'Search provider enabled.':'Built-in matches only. Set SEARXNG_URL for broader name searches.'});
};
