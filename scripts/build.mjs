import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';

const copy = (source, target) => {
  if (!existsSync(source)) throw Error(`Missing proxy asset: ${source}`);
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true, force: true });
};
copy(scramjetPath, 'public/scram');
copy(libcurlPath, 'public/libcurl');
copy(baremuxPath, 'public/baremux');

// libcurl-transport 1.5.x creates HTTPSession before its WASM runtime is ready.
// The generated bundle embeds its WASM, but the runtime still needs to finish
// initialization before HTTPSession can call check_loaded().
const modulePath = 'public/libcurl/index.mjs';
let source = readFileSync(modulePath, 'utf8');
const initStart = source.indexOf('class LibcurlClient');
if (initStart < 0) throw Error('Unexpected libcurl bundle: LibcurlClient missing');
const initEnd = source.indexOf('async meta()', initStart);
if (initEnd < 0) throw Error('Unexpected libcurl bundle: init boundary missing');
const before = source.slice(initStart, initEnd);
if (!before.includes('this.session = new libcurl.HTTPSession(')) {
  throw Error('Unexpected libcurl bundle: HTTPSession initialization missing');
}
if (!before.includes('await libcurl.load_wasm();')) {
  const updated = before.replace(
    'this.session = new libcurl.HTTPSession(',
    '// Wait for the embedded WASM to finish loading before creating a session.\n    await libcurl.load_wasm();\n    this.session = new libcurl.HTTPSession('
  );
  source = source.slice(0, initStart) + updated + source.slice(initEnd);
  writeFileSync(modulePath, source);
}
console.log('Floater static assets ready; libcurl WASM initialization order fixed.');
