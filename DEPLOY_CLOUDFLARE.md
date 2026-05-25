# Despliegue automático: GitHub → Cloudflare

Cada `git push` a la rama `main` construye el sitio y lo publica en Cloudflare Pages (proyecto **operadoresasociadosbogota**).

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

- **Project name:** `operadoresasociadosbogota`
- **Dominio:** operadoresasociadosbogota.com

Si el nombre del proyecto en el dashboard es otro, edita `.github/workflows/deploy-cloudflare.yml` y cambia `--project-name=...`.

## 3. Flujo de trabajo

```bash
git add .
git commit -m "Tu cambio"
git push origin main
```

En GitHub → pestaña **Actions** verás el workflow **Deploy to Cloudflare Pages**. Si termina en verde, el sitio se actualiza solo (1–3 minutos).

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
