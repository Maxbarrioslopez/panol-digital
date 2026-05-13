import { Router } from 'express';
import { costoPorOT, costoPorTrabajador, presupuestoVsReal, consumoNeto } from './costos.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/ot/:otId', authMiddleware, requireRole('COSTO_VER'), costoPorOT);
router.get('/trabajador/:trabajadorId', authMiddleware, requireRole('COSTO_VER'), costoPorTrabajador);
router.get('/presupuesto-vs-real', authMiddleware, requireRole('COSTO_VER'), presupuestoVsReal);
router.get('/consumo-neto', authMiddleware, requireRole('COSTO_VER'), consumoNeto);

export { router as costosRouter };
