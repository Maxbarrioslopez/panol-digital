import { Router } from 'express';
import { listar, obtener, crear, actualizar, listarPorCategoria } from './insumos.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('INSUMO_VER'), listar);
router.get('/categoria/:categoriaId', authMiddleware, requireRole('INSUMO_VER'), listarPorCategoria);
router.get('/:id', authMiddleware, requireRole('INSUMO_VER'), obtener);
router.post('/', authMiddleware, requireRole('INSUMO_CREAR'), crear);
router.put('/:id', authMiddleware, requireRole('INSUMO_EDITAR'), actualizar);

export { router as insumosRouter };
