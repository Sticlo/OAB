import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'dist/sio-angular/browser';
const csrIndex = join(outDir, 'index.csr.html');
const index = join(outDir, 'index.html');

if (!existsSync(csrIndex)) {
  console.error('No se encontró', csrIndex, '- ejecuta ng build primero.');
  process.exit(1);
}

copyFileSync(csrIndex, index);
console.log('Cloudflare Pages: index.html generado desde index.csr.html');
