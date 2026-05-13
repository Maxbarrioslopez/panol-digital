import { Router } from 'express';
import { stockBajo, consumoPorCategoria, exportarExcel, exportarPDF } from './reportes.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/stock-bajo', authMiddleware, requireRole('COSTO_VER'), stockBajo);
router.get('/consumo-categoria', authMiddleware, requireRole('COSTO_VER'), consumoPorCategoria);
router.post('/exportar-excel', authMiddleware, requireRole('COSTO_EXPORTAR'), exportarExcel);
router.post('/exportar-pdf', authMiddleware, requireRole('COSTO_EXPORTAR'), exportarPDF);

export { router as reportesRouter };
