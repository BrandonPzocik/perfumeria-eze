# Perfumería Árabe — Catálogo + Panel de Administrador

Proyecto completo y funcional: catálogo de perfumes con pedidos por WhatsApp
(sin registro) + panel de administrador (con login) para cargar y gestionar
todo el catálogo, incluida importación masiva desde Excel.

**100% local para desarrollar** (sin Docker). En producción se despliega
en **un solo servicio de Render**: el mismo Node sirve el catálogo, el panel
y la API; SQLite y las fotos van en un disco persistente.

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

  ```
  Email:      admin@maisonambar.com
  Contraseña: admin1234
  ```

  ⚠️ Cambiá esta contraseña por una propia antes de usarlo en serio (ver
  sección "Seguridad" más abajo).

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
- Base de datos SQLite con `better-sqlite3` — funciona en Node 20, sin Docker ni
  motor de base de datos aparte.
- Subida de imágenes (perfumes, logo) guardadas en `server/uploads`.
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

En desarrollo local usá `http://localhost:3001/api`. En Render no hace falta
tocar esta variable: el build de producción ya apunta a `/api` (mismo dominio).

---

## 🌐 Desplegar en Render (front + servidor juntos)

Sí: **el catálogo y el servidor van en el mismo servicio de Render**.
Queda una sola URL (por ejemplo `https://perfumeria-arabe.onrender.com`)
que sirve el sitio, el panel `/admin` y la API. Las fotos y la base SQLite
viven en un **disco persistente** para que no se borren en cada deploy.

Hace falta el plan pago más chico (**Starter / 0.5 CPU · 512 MB**, ~USD 7/mes).
El plan Free no admite disco y se apaga solo: perderías el catálogo y las imágenes.

### 1. Subí estos cambios a GitHub

Render despliega desde el repo (`BrandonPzocik/perfumeria-eze`). Commit y push
de `main` con los archivos nuevos (`render.yaml`, etc.).

### 2. Creá el servicio con el Blueprint (recomendado)

1. Entrá a [dashboard.render.com](https://dashboard.render.com) y conectá GitHub.
2. **New → Blueprint**.
3. Elegí el repo `perfumeria-eze` y la rama `main`.
4. Render lee `render.yaml` y te pide **solo** estas dos cosas (son el login del panel):
   - `ADMIN_EMAIL` — el mail con el que vas a entrar a `/admin`
   - `ADMIN_PASSWORD` — una contraseña fuerte, no `admin1234`
5. Confirmá el create. `JWT_SECRET` se genera solo.

Si preferís crearlo a mano: **New → Web Service** → el mismo repo →:

| Campo | Valor |
| --- | --- |
| Runtime | Node |
| Branch | `main` |
| Build command | `npm run install:all && npm run build` |
| Start command | `npm start` |
| Instance type | `0.5 CPU / 512 MB` (Starter), **no Free** |
| Health check path | `/api/health` |

En **Advanced → Disk**: mount path `/data`, tamaño **1 GB**.

Variables de entorno:

```
NODE_VERSION=20.20.2
NODE_ENV=production
DATABASE_FILE=/data/data.db
UPLOAD_DIR=/data/uploads
JWT_SECRET=<generá una clave larga y aleatoria>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=<tu contraseña de admin>
```

No hace falta `VITE_API_URL`: el build de producción ya usa `/api` (mismo dominio).

### 3. Esperá el primer deploy y abrí el sitio

Cuando el deploy esté **Live**:

- Catálogo: `https://<tu-servicio>.onrender.com`
- Panel: `https://<tu-servicio>.onrender.com/admin/login`

La primera vez la base arranca **vacía** (sin los 12 perfumes de ejemplo).
Entrá al panel y cargá el catálogo, el WhatsApp, el logo y las fotos.

`ADMIN_EMAIL` / `ADMIN_PASSWORD` **solo se usan si la base está vacía**.
Si el primer deploy falló después de crear el admin, no se vuelven a leer:
cambiá la contraseña desde un backup o borrá el archivo en el disco.

### 4. Dominio propio (opcional)

En el servicio → **Settings → Custom domains** → agregá `www.tutienda.com`
y cargá el CNAME que te muestra Render en tu DNS.

### 5. Backups

Todo lo importante está en el disco `/data` (`data.db` + `uploads/`).
En el servicio → **Disks** podés tomar un snapshot de vez en cuando.
Si actualizás el catálogo seguido, un backup semanal alcanza.

---

## 🔒 Seguridad en producción

1. Usá una contraseña de admin propia (la de prueba `admin1234` no se crea en Render).
2. Render ya da HTTPS. No expongas `data.db` ni `uploads` en el repo (ya están en `.gitignore`).
3. El disco no está disponible en el plan Free: no lo bajes de plan o perdés los datos.

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
Usá las credenciales de arriba. Si las cambiaste y las olvidaste, borrá
`server/data.db` (perdés los datos cargados) o entrá directo a la base con
cualquier cliente SQLite y actualizá la tabla `admin_users`.

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
