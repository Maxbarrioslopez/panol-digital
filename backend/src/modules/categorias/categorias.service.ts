import { prisma } from '../../config/database';

export async function listar() {
  return prisma.categoriaInsumo.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  });
}

export async function obtener(id: number) {
  const cat = await prisma.categoriaInsumo.findUnique({ where: { id } });
  if (!cat) throw new Error('Categoría no encontrada');
  return cat;
}

export async function crear(data: any, creadoPor: number) {
  return prisma.categoriaInsumo.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      colorClasificacion: data.colorClasificacion,
      creadoPor,
    },
  });
}

export async function actualizar(id: number, data: any, actualizadoPor: number) {
  return prisma.categoriaInsumo.update({
    where: { id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      colorClasificacion: data.colorClasificacion,
      actualizadoPor,
    },
  });
}
