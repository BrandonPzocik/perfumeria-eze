# Perfumería Árabe — Catálogo + Panel de Administrador

Proyecto completo y funcional: catálogo de perfumes con pedidos por WhatsApp
(sin registro) + panel de administrador (con login) para cargar y gestionar
todo el catálogo, incluida importación masiva desde Excel.

**100% local para desarrollar** (sin Docker). En producción el **front** va a
**Vercel** (gratis, 24/7) y la **API** a **Render Free**. Las fotos viven en
**Cloudinary** y el catálogo en **Turso** (SQLite en la nube). Nada de eso
borra `server/data.db` ni `server/uploads` de tu Mac.

---

## 🚀 Puesta en marcha (2 minutos)

Necesitás **Node.js 20** (no 22). Con [nvm](https://github.com/nvm-sh/nvm) es lo más simple:

```bash
nvm install    # lee .nvmrc → instala 20.20.2
nvm use        # activa Node 20 en esta terminal
node -v        # debe mostrar v20.x.x
```

Sin nvm: instalá Node 20 LTS desde [nodejs.org](https://nodejs.org).

### 1. Instalar todo

```bash
npm run setup
```

Esto verifica la versión de Node, instala dependencias del backend (`server/`) y del frontend (`web/`).

Si ya tenés Node 20 activo, también podés usar `npm run install:all`.

### 2. Levantar todo con un solo comando

```bash
npm run dev
```

Esto prende **al mismo tiempo**:

- La API en `http://localhost:3001`
- El sitio en `http://localhost:5173`

La primera vez que arranca, el servidor crea automáticamente:
- La base de datos (`server/data.db`)
- Un usuario administrador de prueba
- 12 perfumes de ejemplo
- Tu logo y el nombre "Perfumería Árabe" ya cargados

### 3. Abrir

- **Catálogo público:** http://localhost:5173
- **Panel de administrador:** http://localhost:5173/admin/login

El usuario admin local se crea la primera vez con `ADMIN_EMAIL` y
`ADMIN_PASSWORD` de `server/.env` (por defecto los valores de
`server/.env.example`). No se muestran en el sitio.

Si preferís levantar cada parte en una terminal separada (por ejemplo para
ver los logs de cada una por separado):

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd web && npm run dev
```

---

## 📦 Qué incluye

### Catálogo público (`web/`)
- Landing con destacados, catálogo con búsqueda y filtros instantáneos
  (familia olfativa, género, marca, ofertas/nuevos/más vendidos).
- Ficha de producto con pirámide olfativa, fotos reales (si las cargaste)
  o ilustración de frasco por familia olfativa si todavía no hay foto.
- Carrito y favoritos sin login (se guardan en el navegador).
- Botón "Finalizar pedido por WhatsApp": arma el mensaje solo con los
  productos, cantidades y el total, y abre WhatsApp.
- 100% responsive, pensado mobile-first.

### Panel de administrador (`web/src/admin`, en `/admin`)
- Login con usuario y contraseña (JWT).
- **Dashboard**: totales, stock, gráficos por familia y marca, rankings de
  más vistos / más agregados al carrito / más pedidos por WhatsApp.
- **Perfumes**: tabla con búsqueda, alta, edición, duplicar, ocultar/publicar,
  destacar y eliminar. Formulario completo (precio, costo, stock, notas
  olfativas, imágenes con arrastrar y soltar, todas las etiquetas).
- **Importar Excel**: subís un `.xlsx` o `.csv`, el sistema sugiere el mapeo
  de columnas, mostrás una vista previa, y al confirmar crea o actualiza
  perfumes por SKU. Al final te muestra "X nuevos, Y actualizados, Z errores".
  También podés exportar el catálogo completo a Excel.
- **Configuración**: número de WhatsApp, mensaje del pedido, logo, redes
  sociales, horario, moneda.

### Backend (`server/`)
- API REST (Express + TypeScript) con autenticación JWT para el panel.
- Base de datos SQLite local al desarrollar; en producción **Turso** (SQLite en la nube).
- Subida de imágenes: en local a `server/uploads`; en producción a **Cloudinary**.
  Las fotos de la Mac no se borran al migrar.
- Importación de Excel/CSV con descarga automática de imágenes por URL.

---

## ⚙️ Configuración

### Cambiar el número de WhatsApp, logo, colores, redes, etc.

Todo esto se configura **desde el panel**, en `/admin/configuracion` — no
hace falta tocar código.

### Variables de entorno del servidor (`server/.env`)

```env
DATABASE_FILE="./data.db"       # archivo de la base de datos SQLite
JWT_SECRET="..."                # cambiala por una clave larga y aleatoria
JWT_EXPIRES_IN="7d"
PORT=3001
ADMIN_EMAIL="admin@maisonambar.com"   # solo se usa la primera vez
ADMIN_PASSWORD="admin1234"            # solo se usa la primera vez
```

`ADMIN_EMAIL` y `ADMIN_PASSWORD` solo se usan para crear el primer usuario
administrador cuando la base de datos está vacía. Si querés arrancar de cero
con otro admin, cambiá estos valores **antes** del primer `npm run dev`, o
borrá `server/data.db` y volvé a arrancar.

### URL de la API que usa el frontend (`web/.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

En desarrollo local usá `http://localhost:3001/api`. En Vercel definí
`VITE_API_URL` con la URL de la API en Render (ver más abajo).

---

## 🔗 Mostrar al cliente sin pagar (tu computadora prendida)

Link HTTPS temporal con [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/). El catálogo y el panel funcionan desde el celular del cliente. **Si apagás la Mac o cerrás la terminal, el link se cae.** Cuando te paguen, pasás a Render.

En la raíz del proyecto (con Node 20):

```bash
npm run share
```

La primera vez instala `cloudflared` con Homebrew si hace falta. Compila el sitio, lo sirve en el puerto `3080` (para no chocar con `npm run dev`) y imprime un link tipo `https://….trycloudflare.com`.

- Catálogo: esa URL
- Panel: `https://….trycloudflare.com/admin/login`
- El link **cambia cada vez** que cortás y volvés a correr `npm run share`
- Dejá esa terminal abierta mientras el cliente mira. Ctrl+C para cortar

---

## 🌐 Publicar gratis (Vercel + Render Free + Cloudinary + Turso)

El sitio público queda en Vercel (siempre prendido). La API en Render Free
(se duerme a los ~15 min sin tráfico: la primera visita puede tardar 30–60 s).
**Las fotos y el catálogo no se pierden** porque no viven en el disco de Render.

En tu Mac **no se borra nada**: `server/data.db` y `server/uploads` quedan
como copia de seguridad. Los scripts solo **copian**.

Hacé los pasos en este orden.

### Paso 1 — Cloudinary (fotos, plan free)

1. Creá cuenta en [cloudinary.com](https://cloudinary.com) (el plan Free alcanza).
2. Entrá a **Dashboard** y copiá:
   - Cloud name
   - API Key
   - API Secret
3. En `server/.env` agregá (no las subas a GitHub):

```env
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
CLOUDINARY_FOLDER="perfumeria"
```

4. En la raíz del proyecto, con Node 20:

```bash
npm run migrate:images
```

Eso sube las fotos de `server/uploads` a Cloudinary y actualiza las URLs
**en tu `data.db` local**. Los archivos de `uploads` **no se borran**.
Si una foto ya era `https://…`, la saltea.

### Paso 2 — Turso (base de datos, plan free)

1. Creá cuenta en [turso.tech](https://turso.tech) y una base (por ejemplo `perfumeria`).
2. Copiá la URL (`libsql://…`) y un token de autenticación.
3. En `server/.env` agregá **solo para este paso**:

```env
TURSO_DATABASE_URL="libsql://...."
TURSO_AUTH_TOKEN="...."
```

4. En la raíz:

```bash
npm run migrate:turso
```

Copia el catálogo local a Turso. Si Turso ya tiene perfumes, no pisa nada
salvo que corras `FORCE_TURSO_MIGRATE=1 npm run migrate:turso`.

5. **Importante:** comentá o borrá `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`
de `server/.env` para que `npm run dev` siga usando tu `data.db` de la Mac.
Dejá las de Cloudinary si querés que las fotos nuevas (desde el admin local)
también se suban a la nube.

### Paso 3 — Subí el código a GitHub

Commit y push de `main` al repo (`BrandonPzocik/perfumeria-eze`).
Nunca subas `.env`, `data.db` ni `uploads/`.

### Paso 4 — API en Render (plan Free)

1. [dashboard.render.com](https://dashboard.render.com) → conectá GitHub.
2. **New → Blueprint**, repo `perfumeria-eze`, rama `main`.
   O a mano: **New → Web Service**, mismo repo.

| Campo | Valor |
| --- | --- |
| Runtime | Node |
| Branch | `main` |
| Build command | `npm run install:all && npm run build` |
| Start command | `npm start` |
| Instance type | **Free** |
| Health check path | `/api/health` |

**No agregues disco.** Completá estas variables:

```
NODE_VERSION=20.20.2
NODE_ENV=production
JWT_SECRET=<clave larga y aleatoria>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=<contraseña fuerte>
TURSO_DATABASE_URL=libsql://....
TURSO_AUTH_TOKEN=....
CLOUDINARY_CLOUD_NAME=....
CLOUDINARY_API_KEY=....
CLOUDINARY_API_SECRET=....
CLOUDINARY_FOLDER=perfumeria
CORS_ORIGIN=https://TU-SITIO.vercel.app
```

`CORS_ORIGIN` lo completás en el paso 5, cuando Vercel te dé la URL
(podés poner un placeholder y editarlo después).

Cuando esté **Live**, probá `https://<tu-servicio>.onrender.com/api/health`.
Debería decir `"database":"turso"` y `"images":"cloudinary"`.

La URL de Render también sirve el sitio, pero el front “oficial” va a ser Vercel.

### Paso 5 — Front en Vercel (gratis)

1. Entrá a [vercel.com](https://vercel.com) e importá el mismo repo.
2. **Root Directory:** `web`
3. Framework: Vite. Build: `npm run build`. Output: `dist`.
4. Environment variable (Production):

```
VITE_API_URL=https://<tu-servicio>.onrender.com/api
```

5. Deploy. Queda una URL tipo `https://perfumeria-eze.vercel.app`.
6. Volvé a Render → Environment → `CORS_ORIGIN` = esa URL de Vercel
   (sin barra final) → Save → que redeploye la API.
7. Catálogo: la URL de Vercel. Panel: `https://….vercel.app/admin/login`.

Si más adelante querés el front también en Render y no en Vercel, no hace falta
`VITE_API_URL` extra: el build usa `/api` en el mismo dominio. Igual las fotos
y la base siguen en Cloudinary y Turso.

### Paso 6 — Comprobar que no se perdió nada

1. Abrí el catálogo en Vercel: tienen que verse las mismas fotos (URLs de Cloudinary).
2. Entrá al panel y editá un perfume: la foto nueva tiene que ir a Cloudinary.
3. En tu Mac, `server/uploads` y `server/data.db` **siguen ahí**.

### Dominio propio (opcional)

En Vercel → Project → Settings → Domains. HTTPS lo da Vercel.

### Backups

- Fotos: Cloudinary + la carpeta `server/uploads` de la Mac.
- Catálogo: Turso + `server/data.db` de la Mac.

No borres esas copias locales.

---

## 🔒 Seguridad en producción

1. Usá una contraseña de admin propia (la de prueba `admin1234` no se crea en Render).
2. Render y Vercel ya dan HTTPS. No expongas `data.db`, `uploads` ni `.env` en el repo.
3. No borres `server/data.db` ni `server/uploads` de la Mac: son el backup.

---

## 🗂 Estructura del proyecto

```
perfumeria-arabe/
├── server/              # API (Express + TypeScript + SQLite local)
│   ├── src/
│   │   ├── db/          # conexión SQLite, migraciones, datos de ejemplo
│   │   ├── routes/      # auth, perfumes, settings, upload, import, stats
│   │   ├── middleware/  # protección de rutas de admin (JWT)
│   │   └── utils/       # helpers (auth, mapeo de datos)
│   ├── uploads/         # imágenes subidas (perfumes, logo)
│   └── data.db          # se crea solo, no se sube al repo
│
└── web/                 # Front (React + TypeScript + Vite + Tailwind)
    └── src/
        ├── components/  # UI del catálogo público
        ├── pages/        # Home, Favoritos
        ├── hooks/        # stores: carrito, favoritos, perfumes, settings
        ├── admin/        # panel de administrador completo
        │   ├── pages/    # login, dashboard, perfumes, importar, config
        │   ├── components/
        │   └── hooks/    # stores de admin (auth, CRUD de perfumes)
        ├── lib/          # cliente API, formato de moneda/WhatsApp
        └── types/
```

---

## ❓ Problemas comunes

**"No pudimos conectar con el servidor" en el catálogo**
El backend no está corriendo. Fijate que `npm run dev` (o `cd server && npm
run dev`) esté andando y que no haya errores en esa terminal.

**El panel de admin no deja entrar**
Usá el email y la contraseña de `ADMIN_EMAIL` / `ADMIN_PASSWORD` en
`server/.env` (solo aplican la primera vez que se crea la base). Si las
olvidaste, borrá `server/data.db` (perdés los datos cargados) o actualizá
la tabla `admin_users` con cualquier cliente SQLite.

**Node me tira un error de versión**
Necesitás Node 20 (no 22). Con nvm: `nvm install && nvm use` en la carpeta del
proyecto (hay `.nvmrc` y `.node-version`). Si tenés Node 22 activo, npm va a
bloquear la instalación a propósito.

**Errores por espacios en la ruta del proyecto**
Si la carpeta tiene espacios (ej. `perfume-catalog 2`), Node 22 suele fallar al
compilar dependencias nativas. Usá Node 20 con `nvm use`, o renombrá la carpeta
sin espacios.

**Quiero que el catálogo y el panel se vean en el celular de la red local**
Corré `cd web && npm run dev -- --host` y entrá desde el celular a la IP de
tu computadora (ej. `http://192.168.0.10:5173`). Recordá que en ese caso el
celular también necesita poder llegar a `http://<tu-ip>:3001`, así que
actualizá `VITE_API_URL` en `web/.env` con esa IP en vez de `localhost`.
