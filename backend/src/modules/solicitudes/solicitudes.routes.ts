import { Router } from 'express';
import {
  crear,
  listar,
  obtener,
  procesar,
  entregar,
  confirmarRecepcion,
  anular,
  disputar,
  listarPendientesRecepcion,
} from './solicitudes.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, requireRole('SOLICITUD_VER'), listar);
router.get('/pendientes-recepcion', authMiddleware, requireRole('SOLICITUD_VER'), listarPendientesRecepcion);
router.get('/:id', authMiddleware, requireRole('SOLICITUD_VER'), obtener);
router.post('/', authMiddleware, requireRole('SOLICITUD_CREAR'), crear);
router.put('/:id/procesar', authMiddleware, requireRole('SOLICITUD_PROCESAR'), procesar);
router.put('/:id/entregar', authMiddleware, requireRole('SOLICITUD_PROCESAR'), entregar);
router.put('/:id/confirmar-recepcion', authMiddleware, requireRole('SOLICITUD_CREAR'), confirmarRecepcion);
router.put('/:id/anular', authMiddleware, requireRole('SOLICITUD_ANULAR'), anular);
router.put('/:id/disputar', authMiddleware, requireRole('SOLICITUD_CREAR'), disputar);

export { router as solicitudesRouter };
