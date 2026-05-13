import { prisma } from '../../config/database';

export async function listar() {
  return prisma.insumo.findMany({
    where: { activo: true },
    include: {
      categoria: { select: { nombre: true, colorClasificacion: true } },
      marca: { select: { nombre: true } },
      modelo: { select: { nombre: true } },
    },
    orderBy: { nombre: 'asc' },
  });
}

export async function listarPorCategoria(categoriaId: number) {
  return prisma.insumo.findMany({
    where: { categoriaId, activo: true },
    include: {
      categoria: { select: { nombre: true, colorClasificacion: true } },
      marca: { select: { nombre: true } },
      modelo: { select: { nombre: true } },
    },
    orderBy: { nombre: 'asc' },
  });
}

export async function obtener(id: number) {
  const insumo = await prisma.insumo.findUnique({
    where: { id },
    include: {
      categoria: true,
      marca: true,
      modelo: true,
    },
  });
  if (!insumo) throw new Error('Insumo no encontrado');
  return insumo;
}

export async function crear(data: any, creadoPor: number) {
  return prisma.insumo.create({
    data: {
      categoriaId: data.categoriaId,
      codigoInterno: data.codigoInterno,
      nombre: data.nombre,
      descripcion: data.descripcion,
      unidadMedida: data.unidadMedida || 'unidad',
      tipoInsumo: data.tipoInsumo || 'CONSUMIBLE',
      marcaId: data.marcaId,
      modeloId: data.modeloId,
      numeroSerie: data.numeroSerie,
      stockActual: data.stockActual || 0,
      stockMinimo: data.stockMinimo || 0,
      estadoEquipo: data.estadoEquipo,
      colorClasificacion: data.colorClasificacion,
      creadoPor,
    },
  });
}

export async function actualizar(id: number, data: any, actualizadoPor: number) {
  return prisma.insumo.update({
    where: { id },
    data: {
      categoriaId: data.categoriaId,
      codigoInterno: data.codigoInterno,
      nombre: data.nombre,
      descripcion: data.descripcion,
      unidadMedida: data.unidadMedida,
      tipoInsumo: data.tipoInsumo,
      marcaId: data.marcaId,
      modeloId: data.modeloId,
      numeroSerie: data.numeroSerie,
      stockMinimo: data.stockMinimo,
      estadoEquipo: data.estadoEquipo,
      colorClasificacion: data.colorClasificacion,
      actualizadoPor,
    },
  });
}
