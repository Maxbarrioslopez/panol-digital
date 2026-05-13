import { prisma } from '../../config/database';
import ExcelJS from 'exceljs';

export async function stockBajo() {
  return prisma.insumo.findMany({
    where: {
      activo: true,
      stockActual: { lte: prisma.insumo.fields.stockMinimo },
    },
    include: { categoria: { select: { nombre: true } } },
    orderBy: { stockActual: 'asc' },
  });
}

export async function consumoPorCategoria() {
  const detalles = await prisma.detalleSolicitud.findMany({
    where: { estadoLinea: 'ENTREGADO' },
    include: {
      insumo: {
        include: { categoria: { select: { nombre: true } } },
      },
    },
  });

  const agrupado = detalles.reduce((acc: any, d) => {
    const cat = d.insumo.categoria.nombre;
    if (!acc[cat]) acc[cat] = { categoria: cat, cantidad: 0, valor: 0 };
    acc[cat].cantidad += Number(d.cantidadEntregada);
    acc[cat].valor += Number(d.cantidadEntregada) * Number(d.costoUnitarioHistorico || 0);
    return acc;
  }, {});

  return Object.values(agrupado);
}

export async function exportarExcel(tipo: string, filtros: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  if (tipo === 'stock-bajo') {
    const data = await stockBajo();
    worksheet.columns = [
      { header: 'Código', key: 'codigo' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Categoría', key: 'categoria' },
      { header: 'Stock Actual', key: 'stockActual' },
      { header: 'Stock Mínimo', key: 'stockMinimo' },
    ];
    data.forEach((i) => worksheet.addRow({
      codigo: i.codigoInterno,
      nombre: i.nombre,
      categoria: i.categoria.nombre,
      stockActual: i.stockActual,
      stockMinimo: i.stockMinimo,
    }));
  } else if (tipo === 'consumo-categoria') {
    const data = await consumoPorCategoria() as any[];
    worksheet.columns = [
      { header: 'Categoría', key: 'categoria' },
      { header: 'Cantidad Total', key: 'cantidad' },
      { header: 'Valor Total', key: 'valor' },
    ];
    data.forEach((i) => worksheet.addRow(i));
  }

  return workbook.xlsx.writeBuffer();
}
