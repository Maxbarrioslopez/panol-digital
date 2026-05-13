import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { usuariosRouter } from './modules/usuarios/usuarios.routes';
import { ordenesTrabajoRouter } from './modules/ordenes-trabajo/ordenes-trabajo.routes';
import { categoriasRouter } from './modules/categorias/categorias.routes';
import { insumosRouter } from './modules/insumos/insumos.routes';
import { solicitudesRouter } from './modules/solicitudes/solicitudes.routes';
import { devolucionesRouter } from './modules/devoluciones/devoluciones.routes';
import { stockRouter } from './modules/stock/stock.routes';
import { costosRouter } from './modules/costos/costos.routes';
import { comprasRouter } from './modules/compras/compras.routes';
import { reportesRouter } from './modules/reportes/reportes.routes';
import { auditoriaRouter } from './modules/auditoria/auditoria.routes';
import { notificacionesRouter } from './modules/notificaciones/notificaciones.routes';
import { procesosRouter } from './modules/procesos/procesos.routes';
import { setupWebSocket, notifyRoom } from './websocket/events';
import { notificationBus } from './websocket/notification-bus';

export const prisma = new PrismaClient();
export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/ordenes-trabajo', ordenesTrabajoRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/insumos', insumosRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/devoluciones', devolucionesRouter);
app.use('/api/stock', stockRouter);
app.use('/api/costos', costosRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/auditoria', auditoriaRouter);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/procesos', procesosRouter);

// WebSocket
setupWebSocket(io);

// Forward app events to Socket.io rooms
notificationBus.on('app-event', (event) => {
  if (event.room) {
    notifyRoom(io, event.room, event.type, event.payload);
  } else {
    io.emit(event.type, event.payload);
  }
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR',
  });
});

const PORT = env.PORT;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
