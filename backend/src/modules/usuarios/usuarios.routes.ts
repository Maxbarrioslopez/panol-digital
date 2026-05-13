import { Router } from 'express';
import { listar, obtener, crear, actualizar, desactivar } from './usuarios.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('USUARIO_VER', 'USUARIO_CREAR'), listar);
router.get('/:id', authMiddleware, requireRole('USUARIO_VER'), obtener);
router.post('/', authMiddleware, requireRole('USUARIO_CREAR'), crear);
router.put('/:id', authMiddleware, requireRole('USUARIO_EDITAR'), actualizar);
router.delete('/:id', authMiddleware, requireRole('USUARIO_EDITAR'), desactivar);

export { router as usuariosRouter };
