import { Router } from 'express';
import { listar, obtener, crear, actualizar } from './categorias.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('INSUMO_VER'), listar);
router.get('/:id', authMiddleware, requireRole('INSUMO_VER'), obtener);
router.post('/', authMiddleware, requireRole('CATEGORIA_CREAR'), crear);
router.put('/:id', authMiddleware, requireRole('CATEGORIA_EDITAR'), actualizar);

export { router as categoriasRouter };
