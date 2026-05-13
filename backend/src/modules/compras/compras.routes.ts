import { Router } from 'express';
import { listar, crear, autorizar, recepcionar } from './compras.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('COMPRA_AUTORIZAR'), listar);
router.post('/', authMiddleware, requireRole('COMPRA_AUTORIZAR'), crear);
router.put('/:id/autorizar', authMiddleware, requireRole('COMPRA_AUTORIZAR'), autorizar);
router.put('/:id/recepcionar', authMiddleware, requireRole('CONFIG_VER'), recepcionar);

export { router as comprasRouter };
