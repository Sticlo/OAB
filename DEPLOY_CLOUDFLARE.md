# Despliegue automático: GitHub → Cloudflare

Cada `git push` a la rama `main` construye el sitio y lo publica en el Worker **operadoresasociadosbogota1** (dominio `operadoresasociadosbogota.com`).

## 1. Secretos en GitHub (obligatorio, una sola vez)

Repositorio: [github.com/Sticlo/OAB](https://github.com/Sticlo/OAB)

1. En Cloudflare: **Mi perfil** → **API Tokens** → **Create Token**
2. Usa la plantilla **Edit Cloudflare Workers** (o permisos: Account / Cloudflare Pages → Edit)
3. Copia el token

En GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Nombre | Valor |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | Token que creaste |
| `CLOUDFLARE_ACCOUNT_ID` | ID de cuenta (Cloudflare → Workers & Pages → columna derecha **Account ID**) |

## 2. Comprobar el proyecto en Cloudflare

El workflow despliega a:

- **Worker name:** `operadoresasociadosbogota1` (ver `wrangler.toml`)
- **Dominio:** operadoresasociadosbogota.com

Si el nombre del Worker en Cloudflare es otro, edita `wrangler.toml` (`name = "..."`).

## 3. Flujo de trabajo

```bash
git add .
git commit -m "Tu cambio"
git push origin main
```

En GitHub → pestaña **Actions** verás **Deploy to Cloudflare Workers**. Si termina en verde, el sitio se actualiza solo (1–3 minutos).

Si también tienes **Connect to Git** en Cloudflare, configura el build igual que abajo; el push a `main` puede desplegar desde GitHub Actions o desde Cloudflare (no hace falta duplicar si uno ya funciona).

## 4. Alternativa: Git directo en Cloudflare (nuevo proyecto)

Cloudflare **no permite** enlazar Git a un proyecto que solo usa “subida manual”. Si prefieres todo desde el dashboard:

1. **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**
2. Repositorio: **Sticlo/OAB**
3. Configuración de build:

| Campo | Valor |
|-------|--------|
| Production branch | `main` |
| Build command | `npm run build:pages` |
| Build output directory | `dist/sio-angular/browser` |
| Root directory | `/` |

4. Conecta el dominio **operadoresasociadosbogota.com** al nuevo proyecto y desactiva el deploy manual del anterior.

## 5. Build local (opcional)

```bash
npm run build:pages
```

Salida: `dist/sio-angular/browser`

## 6. Sitio en blanco o error 404

Si el dominio responde **404** o **pantalla en blanco**, casi siempre falta un deploy correcto:

| Síntoma | Causa habitual | Qué hacer |
|---------|----------------|-----------|
| 404 en todo el sitio | No hay deploy o build output incorrecto | Worker `operadoresasociadosbogota1` → **Deployments**: deploy en verde con assets |
| Pantalla en blanco | Build output incorrecto o hydration en estático | **Build command:** `npm run build:pages` — assets en `dist/sio-angular/browser` (`wrangler.toml`) |
| Worker URL "Inactive" | Solo afecta `*.workers.dev`; el dominio propio puede seguir activo | En **Domains** verifica `operadoresasociadosbogota.com` en el Worker `operadoresasociadosbogota1` |
| Actions falla | Faltan secretos en GitHub | Añadir `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (sección 1) |

**Configuración correcta en Cloudflare (Connect to Git o manual):**

- Build command: `npm run build:pages`
- Build output directory: `dist/sio-angular/browser`
- Node: 22 (`.nvmrc`)

Tras `git push` a `main`, revisa **GitHub → Actions**. Si el workflow termina en verde, espera 1–3 minutos y recarga el sitio con Ctrl+Shift+R.

**Probar el build en tu Mac:**

```bash
npm run build:pages
npm run build:pages && npx wrangler deploy
```

(Necesitas `wrangler login` o `CLOUDFLARE_API_TOKEN` en el entorno.)
