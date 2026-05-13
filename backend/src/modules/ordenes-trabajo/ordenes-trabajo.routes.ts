import { Router } from 'express';
import { listar, obtener, crear, actualizar } from './ordenes-trabajo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('OT_VER'), listar);
router.get('/:id', authMiddleware, requireRole('OT_VER'), obtener);
router.post('/', authMiddleware, requireRole('OT_CREAR'), crear);
router.put('/:id', authMiddleware, requireRole('OT_EDITAR'), actualizar);

export { router as ordenesTrabajoRouter };
