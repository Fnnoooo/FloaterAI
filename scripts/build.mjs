import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
const copy=(source,target)=>{if(!existsSync(source))throw Error(`Missing proxy asset: ${source}`);mkdirSync(target,{recursive:true});cpSync(source,target,{recursive:true,force:true});};
copy(scramjetPath,'public/scram');
copy(libcurlPath,'public/libcurl');
copy(baremuxPath,'public/baremux');
console.log('Floater static assets ready for Netlify.');
