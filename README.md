# Pañol Digital

Sistema completo de gestión de pañol digital para control de insumos consumibles y reutilizables, con trazabilidad completa, control de costos por OT, y workflow multi-rol.

## Características principales

- **Multi-rol:** Trabajador, Pañolero, Supervisor, Oficina Técnica, Superusuario
- **Solicitudes guiadas:** Wizard de 5 pasos para solicitar insumos
- **Control de stock:** En tiempo real con alertas de stock bajo
- **Insumos reutilizables:** Control por estado (bueno/dañado/cuarentena)
- **Costos valorizados:** Por OT, trabajador, proceso/subproceso
- **Presupuesto vs Real:** Comparativa con gráficos
- **Auditoría completa:** Toda acción crítica queda registrada
- **Exportación:** Excel y PDF de reportes
- **Dark/Light mode:** Persistencia en localStorage
- **Bilingüe:** Español e Inglés (i18n)
- **Responsive:** Mobile-first design

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Estado | Zustand |
| Gráficos | Recharts |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| Tiempo real | Socket.io |
| Contenedores | Docker + docker-compose |

## Inicio rápido

### Requisitos

- Docker y docker-compose
- Node.js 20+ (para desarrollo local)
- npm o yarn

### Con Docker (recomendado)

```bash
# Clonar o navegar al proyecto
cd panol-digital

# Copiar variables de entorno
cp .env.example .env

# Levantar todo (DB + Backend + Frontend)
docker compose up --build

# En otra terminal, ejecutar migraciones y seed
docker exec panol-backend npx prisma migrate dev --name init
docker exec panol-backend npx tsx src/seed.ts

# Acceder
# Frontend:  http://localhost:3000
# Backend:   http://localhost:4000/api
# DB:        localhost:5432
```

### Desarrollo local (sin Docker)

```bash
# Terminal 1: Base de datos (requiere PostgreSQL local)
# Crear base de datos panol_digital

# Terminal 2: Backend
cd backend
npm install
npx prisma generate --schema=../database/prisma/schema.prisma
npx prisma migrate dev --schema=../database/prisma/schema.prisma
npx tsx src/seed.ts
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

## Usuarios de prueba

| Rol | RUT | Clave | Descripción |
|-----|-----|-------|-------------|
| Superusuario | `1-9` | `A1234` | Acceso total |
| Supervisor | `12345678-9` | `B5678` | Gestión operativa |
| Pañolero | `11111111-1` | `C9012` | Entregas y devoluciones |
| Trabajador | `22222222-2` | `D3456` | Solicita insumos |
| Oficina Técnica | `33333333-3` | `E7890` | Reportes de costos |

> En la página de login hay **botones de acceso rápido** para cada cuenta.

## Flujos de trabajo

### 1. Trabajador solicita insumos
1. Login → Selecciona OT → Categoría → Insumos (+/-) → Proceso/Subproceso → Confirmar
2. Si no hay stock, puede justificar la solicitud
3. Si tiene recepción pendiente, el sistema bloquea nuevas solicitudes

### 2. Pañolero procesa solicitud
1. Ve cola de solicitudes pendientes
2. Selecciona solicitud → revisa ítems
3. Puede: entregar completo, anular ítems (con motivo), modificar cantidades (con justificación)
4. Marca como entregada → notifica al trabajador
5. Trabajador confirma recepción para cerrar el circuito

### 3. Devolución de insumos
1. Trabajador lleva insumos sobrantes al pañol
2. Pañolero selecciona OT → elige insumos → ingresa cantidad → selecciona estado (bueno/dañado/cuarentena)
3. Stock se actualiza automáticamente

### 4. Supervisor gestiona
- Crea/edita usuarios, insumos, categorías, procesos, OTs
- Autoriza compras
- Recibe compras (actualiza stock y costo)
- Desbloquea trabajadores
- Ve movimientos de stock

### 5. Oficina Técnica analiza costos
- Dashboard con gráficos (Presupuesto vs Real, Consumo por categoría)
- Costo por OT, trabajador, proceso
- Exporta a Excel/PDF

### 6. Superusuario administra
- Auditoría completa de acciones
- Configuración del sistema
- Corrección de datos con trazabilidad

## Estructura del proyecto

```
panol-digital/
├── docker-compose.yml          # Orquestación de contenedores
├── .env.example                # Variables de entorno
├── README.md                   # Este archivo
├── database/
│   ├── prisma/schema.prisma    # Modelo de datos completo
│   └── seeds.sql               # Datos iniciales
├── backend/
│   ├── src/server.ts           # Entry point
│   ├── src/config/             # DB, Auth, Env
│   ├── src/middleware/         # Auth JWT, Roles, Auditoría
│   ├── src/modules/            # 13 módulos API REST
│   │   ├── auth/               # Login, refresh, recuperación
│   │   ├── usuarios/           # CRUD usuarios
│   │   ├── ordenes-trabajo/    # CRUD OTs
│   │   ├── categorias/         # CRUD categorías
│   │   ├── insumos/            # CRUD insumos + marcas/modelos
│   │   ├── procesos/           # Procesos y subprocesos
│   │   ├── solicitudes/        # Motor state machine
│   │   ├── devoluciones/       # Reingreso
│   │   ├── stock/              # Movimientos + ajustes
│   │   ├── costos/             # Cálculo valorizado
│   │   ├── compras/            # Autorización y recepción
│   │   ├── reportes/           # Excel/PDF
│   │   ├── auditoria/          # Logs de acciones
│   │   └── notificaciones/     # WebSocket
│   └── src/websocket/          # Socket.io events
└── frontend/
    ├── src/App.tsx             # Router con guards
    ├── src/i18n.ts             # Español + Inglés
    ├── src/store/              # Zustand (auth + theme)
    ├── src/services/api.ts     # Axios con interceptores
    ├── src/components/layout/  # Navbar, Sidebar, Layout
    └── src/pages/
        ├── auth/               # Login, Recuperar, Cambiar clave
        ├── trabajador/         # Dashboard, Wizard, Mis solicitudes
        ├── panolero/           # Dashboard, Detalle, Reingreso, Historial
        ├── supervisor/         # Dashboard, CRUDs, Compras, Desbloqueos
        ├── oficina-tecnica/    # Dashboard, Costos, Exportar
        └── superusuario/       # Auditoría, Config, Corrección
```

## API Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con RUT + clave |
| GET | `/api/auth/me` | Perfil del usuario |
| GET | `/api/auth/roles` | Listar roles |
| GET | `/api/usuarios` | CRUD usuarios |
| GET | `/api/insumos` | CRUD insumos |
| GET | `/api/ordenes-trabajo` | CRUD OTs |
| POST | `/api/solicitudes` | Crear solicitud |
| PUT | `/api/solicitudes/:id/procesar` | Procesar solicitud |
| PUT | `/api/solicitudes/:id/entregar` | Entregar físicamente |
| PUT | `/api/solicitudes/:id/confirmar-recepcion` | Confirmar recepción |
| POST | `/api/devoluciones` | Registrar devolución |
| GET | `/api/costos/ot/:otId` | Costo por OT |
| GET | `/api/reportes/stock-bajo` | Alertas de stock |
| POST | `/api/reportes/exportar-excel` | Exportar Excel |

## Estado de las migraciones

```bash
# Generar cliente Prisma
npx prisma generate --schema=database/prisma/schema.prisma

# Crear migración
npx prisma migrate dev --schema=database/prisma/schema.prisma

# Ejecutar seed
npx tsx backend/src/seed.ts

# Studio visual
npx prisma studio --schema=database/prisma/schema.prisma
```

## Variables de entorno

```env
# Backend
DATABASE_URL=postgresql://panol:panol123@localhost:5432/panol_digital?schema=public
PORT=4000
JWT_SECRET=tu-clave-secreta-jwt
JWT_REFRESH_SECRET=tu-clave-refresh-jwt

# Frontend
VITE_API_URL=http://localhost:4000
```

## Deploy en Vercel

El frontend está deployado en Vercel como SPA:

```
URL: https://frontend-1frhq5bwr-maxbarrioslopezs-projects.vercel.app
```

> **Nota:** El frontend se conecta al backend en `http://localhost:4000`. Al abrirlo desde Vercel sin el backend corriendo, verás el login y la UI pero las API calls fallarán. Para prueba completa, clona el repo y corre localmente.

### Desplegar tu propio frontend

```bash
# 1. Clonar
git clone https://github.com/Maxbarrioslopez/panol-digital.git
cd panol-digital

# 2. Instalar frontend
cd frontend && npm install

# 3. Build
npm run build

# 4. Deploy a Vercel (CLI)
vercel deploy . --prod -y
```

## Variables de entorno
