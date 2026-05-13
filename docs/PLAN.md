# Plan de Implementación — Pañol Digital

## Estado General

| Fase | Estado | Fecha Inicio | Fecha Fin | Notas |
|------|--------|--------------|-----------|-------|
| F0: Estructura base | Completada | 2026-05-12 | 2026-05-12 | docker-compose, carpetas, configs, .env |
| F1: Base de datos | Completada | 2026-05-12 | 2026-05-12 | Prisma schema completo, seeds.sql con datos reales |
| F2: Backend Auth | Completada | 2026-05-12 | 2026-05-12 | JWT, login, refresh, recuperación, middleware roles+permisos |
| F3: Backend Maestros | Completada | 2026-05-12 | 2026-05-12 | CRUD usuarios, OT, categorías, insumos, procesos/subprocesos |
| F4: Backend Solicitudes | Completada | 2026-05-12 | 2026-05-12 | State machine completo: crear, procesar, entregar, confirmar, anular, disputar |
| F5: Backend Reportes | Completada | 2026-05-12 | 2026-05-12 | Costos, devoluciones, stock, compras, reportes Excel, auditoría, WebSocket |
| F6: Frontend Setup | Completada | 2026-05-12 | 2026-05-12 | Vite, Tailwind, i18n ES/EN, theme dark/light, router, Zustand stores |
| F7: Frontend Auth | Completada | 2026-05-12 | 2026-05-12 | Login con RUT, ThemeToggle, LanguageSwitcher, AuthContext, PrivateLayout |
| F8: Frontend Trabajador | Completada | 2026-05-12 | 2026-05-12 | Dashboard con alertas, Wizard 5 pasos (OT→Cat→Insumos→Proc→Resumen), Mis solicitudes |
| F9: Frontend Pañolero | Completada | 2026-05-12 | 2026-05-12 | Dashboard con KPIs, cola de solicitudes, detalle con anulación/entrega, reingreso/devolución |
| F10: Frontend Supervisor/OT | Completada | 2026-05-12 | 2026-05-12 | Dashboard con stock bajo, Oficina Técnica con gráficos Recharts (bar+pie) |
| F11: Frontend Superusuario | Completada | 2026-05-12 | 2026-05-12 | Auditoría con tabla paginada y filtros |
| F12: Integración final | En progreso | 2026-05-12 | — | README, Docker, pendiente: pruebas manuales y ajustes finos |

## Stack Confirmado

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand + TanStack Query + Recharts + react-i18next
- **Backend:** Node.js + Express + TypeScript + Prisma + Socket.io + Zod + Nodemailer
- **DB:** PostgreSQL 16
- **Infra:** Docker + docker-compose

## Requerimientos UX/UI Confirmados

- Dark / Light mode (persistencia localStorage)
- Español e Inglés (i18n completo front + back)
- Procesos guiados con wizard visual
- Dashboards modernos con KPIs y gráficos
- Mobile-first design
- Skeleton loaders, empty states, toast notifications
- Tooltips y guía en cada paso

## Reglas de Negocio Críticas

1. Clave formato: 1 letra mayúscula + 4 números (ej: A1234)
2. Bloqueo de trabajador si tiene recepción pendiente (estado ENTREGADA)
3. Solo pañolero/supervisor/superusuario puede registrar devoluciones
4. Costo neto = entregado - devuelto (usando costo unitario histórico)
5. Insumos reutilizables: control por estado (bueno/dañado/cuarentena)
6. Anulaciones siempre con motivo
7. Auditoría automática en acciones críticas
8. Soft deletes (activo/inactivo), nunca DELETE físico en datos maestros

## Decisiones Técnicas Pendientes de Registro

- Puerto frontend: 3000
- Puerto backend: 4000
- Puerto DB: 5432
- Superusuario inicial: admin / 1-9 / A1234
- Seed con datos de prueba: Sí
