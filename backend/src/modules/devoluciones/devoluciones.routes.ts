import { Router } from 'express';
import { listar, crear } from './devoluciones.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('DEVOLUCION_CREAR'), listar);
router.post('/', authMiddleware, requireRole('DEVOLUCION_CREAR'), crear);

export { router as devolucionesRouter };
