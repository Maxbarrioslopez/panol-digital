import { Router } from 'express';
import { listar } from './auditoria.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('AUDITORIA_VER'), listar);

export { router as auditoriaRouter };
