import { Router } from 'express';
import { listar, ajustarManual } from './stock.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/movimientos', authMiddleware, requireRole('INSUMO_VER'), listar);
router.post('/ajuste', authMiddleware, requireRole('CONFIG_VER'), ajustarManual);

export { router as stockRouter };
