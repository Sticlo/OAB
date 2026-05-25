import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'dist/sio-angular/browser';
const index = join(outDir, 'index.html');
const csrIndex = join(outDir, 'index.csr.html');

if (existsSync(index)) {
  console.log('Cloudflare Pages: index.html listo.');
  process.exit(0);
}

if (existsSync(csrIndex)) {
  copyFileSync(csrIndex, index);
  console.log('Cloudflare Pages: index.html generado desde index.csr.html');
  process.exit(0);
}

console.error('No se encontró index.html en', outDir);
process.exit(1);
