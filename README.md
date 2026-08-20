# Perfumería Árabe — Catálogo + Panel de Administrador

Proyecto completo y funcional: catálogo de perfumes con pedidos por WhatsApp
(sin registro) + panel de administrador (con login) para cargar y gestionar
todo el catálogo, incluida importación masiva desde Excel.

**100% local, sin Docker, sin servicios externos.** La base de datos es un
archivo SQLite que se crea solo la primera vez que corrés el servidor.

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

Si en algún momento subís el backend a un servidor con otra URL, actualizá
esta variable.

---

## 🔒 Seguridad antes de usarlo en producción

Este proyecto está listo para **probar y usar localmente**. Antes de
publicarlo en internet:

1. Cambiá `ADMIN_PASSWORD` en `server/.env` (o creá un nuevo admin y borrá
   el de prueba) y cambiá `JWT_SECRET` por una clave larga y aleatoria.
2. El backend no tiene HTTPS propio: si lo publicás, ponelo detrás de un
   proxy (nginx, Caddy, Vercel, Railway, Render, etc.) que dé HTTPS.
3. `server/data.db` y `server/uploads` contienen todos tus datos: hacé
   backups periódicos (son simples archivos, copiarlos alcanza).

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
