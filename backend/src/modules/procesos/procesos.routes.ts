import { Router } from 'express';
import { listarProcesos, listarSubprocesos, crearProceso, actualizarProceso, crearSubproceso, actualizarSubproceso } from './procesos.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/procesos', authMiddleware, listarProcesos);
router.post('/procesos', authMiddleware, requireRole('CONFIG_VER'), crearProceso);
router.put('/procesos/:id', authMiddleware, requireRole('CONFIG_VER'), actualizarProceso);
router.get('/procesos/:procesoId/subprocesos', authMiddleware, listarSubprocesos);
router.post('/procesos/:procesoId/subprocesos', authMiddleware, requireRole('CONFIG_VER'), crearSubproceso);
router.put('/subprocesos/:id', authMiddleware, requireRole('CONFIG_VER'), actualizarSubproceso);

export { router as procesosRouter };
