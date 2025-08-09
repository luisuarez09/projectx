# CRM Fiscal (ProjectX)

Aplicación web para gestión de **clientes**, **presupuestos** y próximamente **facturación/pagos**, desarrollada con **React + Vite + Tailwind + shadcn/ui** en el frontend, **API Express + Prisma** en el backend, y **PostgreSQL** en **Docker**.  
Optimizada para entornos Windows, macOS y Linux.

---

## 🧱 Stack Tecnológico

- **Frontend:** React (Vite), Tailwind CSS, shadcn/ui, React Router.
- **Backend:** Node.js con Express (ESM), Prisma ORM.
- **Base de Datos:** PostgreSQL 16 (Docker), pgAdmin (opcional).
- **Infraestructura Local:** Docker Compose + backups automáticos.

---

## 🚀 Requisitos Previos

- **Node.js** `^20.19.0` o `>=22.12.0`  
  > Recomendado: Node 20.19.0 (compatible estable con Vite y Prisma)  
  En Windows, instalar **NVM for Windows**:
  ```powershell
  nvm install 20.19.0
  nvm use 20.19.0
  ```

- **Docker Desktop** (para PostgreSQL, pgAdmin y API dockerizada)  
- **Git** (para clonar repositorio)

> 💡 Si tienes antivirus (Avast/ESET/Kaspersky, etc.), desactiva temporalmente "HTTPS scanning / SSL inspection" si obtienes errores npm como `ERR_SSL_CIPHER_OPERATION_FAILED`.

---

## 📦 Instalación del Proyecto

```bash
git clone https://github.com/luisuarez09/projectx.git
cd projectx
npm install
```

**Alias de `@` en imports**  
Configura `vite.config.js` así:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    host: true,
    port: 5173,
    proxy: { "/api": "http://localhost:4000" }
  },
});
```

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
DATABASE_URL="postgresql://admin:adminpass@localhost:5432/projectx?schema=public"
```

> En Docker, el host será `postgres` (lo resuelve `docker-compose` internamente).

---

## 🐳 Base de Datos con Docker

Archivo `docker-compose.yml` incluido:

- **postgres**: Base de datos  
- **pgadmin**: Administrador web en `http://localhost:5050` (usuario `admin@example.com` / pass `adminpass`)  
- **backup**: Volcado diario en `./backups`

Inicia la base de datos:

```bash
docker compose up -d
```

---

## 🗃️ Prisma: Modelos y Migraciones

1. Edita el modelo en `prisma/schema.prisma` (ya incluye `Client` y `Estimate`).
2. Ejecuta migraciones:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Abre Prisma Studio (opcional):
   ```bash
   npx prisma studio
   ```

---

## 🧩 Backend (API Express + Prisma)

Ubicación: `api/index.js` (ESM).

**Endpoints disponibles:**

- `GET    /api/health`
- `GET    /api/clients`
- `POST   /api/clients`
- `PUT    /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET    /api/estimates`
- `POST   /api/estimates`

Ejecutar API localmente:

```bash
node api/index.js
```

Prueba en navegador o Postman:

- [http://localhost:4000/api/health](http://localhost:4000/api/health)
- [http://localhost:4000/api/clients](http://localhost:4000/api/clients)

---

## 🌐 Frontend

Rutas definidas en `App.jsx`:

- `/clients` — CRUD de clientes (con modal de confirmación de borrado)
- `/estimates` — Presupuestos con correlativo anual

Inicia el frontend:

```bash
npm run dev
```

- App: `http://localhost:5173`
- API vía proxy: `http://localhost:5173/api/...`

---

## 🐳 API en Docker (opcional)

El proyecto incluye `api/Dockerfile` y `api/start.sh` para dockerizar también la API.

Levanta todo junto (DB + API + pgAdmin + backups):

```bash
docker compose up -d --build
```

Servicios disponibles:

- API: `http://localhost:4000/api/health`
- DB: `localhost:5432` (usuario `admin`, pass `adminpass`, DB `projectx`)
- pgAdmin: `http://localhost:5050`
- Backups: carpeta `./backups`

---

## 🧪 Prueba Rápida End-to-End

1. `docker compose up -d`
2. `npx prisma migrate dev`
3. `node api/index.js`
4. `npm run dev`
5. Crear un cliente y verificar que aparece en la tabla.
6. Crear un presupuesto y confirmar que se lista correctamente.

---

## 🛠️ Scripts Útiles

`package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "api": "node api/index.js",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🐞 Solución de Problemas Comunes

- **EPERM / ENOTEMPTY al instalar**  
  Cierra VS Code, mata procesos Node y limpia:
  ```powershell
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
  npx rimraf node_modules
  Remove-Item package-lock.json
  npm cache clean --force
  npm install
  ```

- **`ERR_SSL_CIPHER_OPERATION_FAILED`**  
  Verifica antivirus y configura npm:
  ```powershell
  npm config delete proxy
  npm config delete https-proxy
  npm config set registry https://registry.npmjs.org/
  npm ping
  ```

- **`require is not defined` en API**  
  Usa `import` y `export` en lugar de `require`.

- **Error 404 en `/api/...`**
  - Asegúrate que la API corre en `:4000`.
  - Proxy configurado en `vite.config.js`.
  - `fetch("/api/clients")` en frontend.

---

## 📂 Estructura del Proyecto

```
projectx/
├─ api/
│  ├─ index.js
│  ├─ Dockerfile
│  └─ start.sh
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ components/ui/
│  ├─ pages/
│  │  ├─ clients.jsx
│  │  └─ estimates.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ docker-compose.yml
├─ package.json
└─ README.md
```

---

## 📌 Roadmap

- [x] Clientes (CRUD)
- [x] Presupuestos
- [ ] Bancos / Cuentas
- [ ] Facturas
- [ ] Pagos multi-moneda
- [ ] Generación de PDFs
- [ ] Recordatorios fiscales

---

## 📄 Licencia

Privado — Uso interno únicamente.
