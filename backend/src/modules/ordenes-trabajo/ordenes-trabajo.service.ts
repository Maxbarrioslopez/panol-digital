import { prisma } from '../../config/database';

export async function listar(soloActivas: boolean) {
  return prisma.ordenTrabajo.findMany({
    where: soloActivas ? { estado: 'ACTIVA', activo: true } : { activo: true },
    orderBy: { fechaCreacion: 'desc' },
  });
}

export async function obtener(id: number) {
  const ot = await prisma.ordenTrabajo.findUnique({ where: { id } });
  if (!ot) throw new Error('Orden de trabajo no encontrada');
  return ot;
}

export async function crear(data: any, creadoPor: number) {
  return prisma.ordenTrabajo.create({
    data: {
      codigo: data.codigo,
      descripcion: data.descripcion,
      estado: data.estado || 'ACTIVA',
      estadoEquipo: data.estadoEquipo,
      presupuestoEstimado: data.presupuestoEstimado,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
      creadoPor,
    },
  });
}

export async function actualizar(id: number, data: any, actualizadoPor: number) {
  return prisma.ordenTrabajo.update({
    where: { id },
    data: {
      descripcion: data.descripcion,
      estado: data.estado,
      estadoEquipo: data.estadoEquipo,
      presupuestoEstimado: data.presupuestoEstimado,
      fechaCierre: data.fechaCierre ? new Date(data.fechaCierre) : undefined,
      actualizadoPor,
    },
  });
}
