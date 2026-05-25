import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  // Serve static files from /browser
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: false
  }));

  // Serve dynamic sitemap.xml
  server.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml');
    res.send(generateSitemap());
  });

  // All regular routes handled by Angular SSR engine
  server.use((req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: 'REQUEST_URL', useValue: originalUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

// Generate sitemap.xml dynamically
function generateSitemap(): string {
  const baseUrl = process.env['BASE_URL'] || 'https://operadoresasociadosbogota.com';
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/home', priority: '1.0', changefreq: 'daily' },
    { path: '/productos', priority: '0.8', changefreq: 'weekly' },
    { path: '/servicios', priority: '0.8', changefreq: 'weekly' },
    { path: '/nosotros', priority: '0.7', changefreq: 'monthly' },
    { path: '/contacto', priority: '0.9', changefreq: 'monthly' },
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  routes.forEach(route => {
    sitemap += `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

const server = app();

const port = process.env['PORT'] || 4000;
server.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
