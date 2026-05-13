import { prisma } from '../../config/database';

function calcularCosto(detalles: any[]) {
  let costoBruto = 0;
  let costoDevolucion = 0;

  for (const d of detalles) {
    const costoUnitario = Number(d.costoUnitarioHistorico || 0);
    const entregado = Number(d.cantidadEntregada || 0);
    const devuelto = Number(d.cantidadDevuelta || 0);

    costoBruto += entregado * costoUnitario;
    costoDevolucion += devuelto * costoUnitario;
  }

  return {
    costoBruto,
    costoDevolucion,
    costoNeto: costoBruto - costoDevolucion,
  };
}

export async function costoPorOT(otId: number) {
  const solicitudes = await prisma.solicitud.findMany({
    where: { otId, estado: { in: ['COMPLETADA', 'ENTREGADA'] } },
    include: { detalles: true },
  });

  const ot = await prisma.ordenTrabajo.findUnique({ where: { id: otId } });

  let total = 0;
  const detalle = solicitudes.map((s) => {
    const costos = calcularCosto(s.detalles);
    total += costos.costoNeto;
    return { solicitudId: s.id, ...costos };
  });

  return {
    otId,
    codigoOT: ot?.codigo,
    presupuestoEstimado: ot?.presupuestoEstimado,
    totalCostoNeto: total,
    desviacion: ot?.presupuestoEstimado ? total - Number(ot.presupuestoEstimado) : null,
    solicitudes: detalle,
  };
}

export async function costoPorTrabajador(trabajadorId: number) {
  const solicitudes = await prisma.solicitud.findMany({
    where: { trabajadorId, estado: { in: ['COMPLETADA', 'ENTREGADA'] } },
    include: { detalles: true },
  });

  let total = 0;
  for (const s of solicitudes) {
    total += calcularCosto(s.detalles).costoNeto;
  }

  return { trabajadorId, totalCostoNeto: total, cantidadSolicitudes: solicitudes.length };
}

export async function presupuestoVsReal(query: any) {
  const ots = await prisma.ordenTrabajo.findMany({
    where: { estado: 'ACTIVA', presupuestoEstimado: { not: null } },
    include: {
      solicitudes: {
        where: { estado: { in: ['COMPLETADA', 'ENTREGADA'] } },
        include: { detalles: true },
      },
    },
  });

  return ots.map((ot) => {
    let real = 0;
    for (const s of ot.solicitudes) {
      real += calcularCosto(s.detalles).costoNeto;
    }
    const presupuesto = Number(ot.presupuestoEstimado || 0);
    return {
      otId: ot.id,
      codigo: ot.codigo,
      presupuesto,
      real,
      desviacion: real - presupuesto,
      porcentajeDesviacion: presupuesto > 0 ? ((real - presupuesto) / presupuesto) * 100 : 0,
    };
  });
}

export async function consumoNeto(query: any) {
  const detalles = await prisma.detalleSolicitud.findMany({
    where: {
      estadoLinea: { in: ['ENTREGADO', 'DEVUELTO_PARCIAL', 'DEVUELTO_TOTAL'] },
    },
    include: {
      insumo: { select: { nombre: true } },
      solicitud: { select: { ot: { select: { codigo: true } } } },
    },
  });

  const agrupado = detalles.reduce((acc: any, d) => {
    const key = d.insumo.nombre;
    if (!acc[key]) acc[key] = { insumo: key, entregado: 0, devuelto: 0, neto: 0 };
    acc[key].entregado += Number(d.cantidadEntregada || 0);
    acc[key].devuelto += Number(d.cantidadDevuelta || 0);
    acc[key].neto += Number(d.cantidadEntregada || 0) - Number(d.cantidadDevuelta || 0);
    return acc;
  }, {});

  return Object.values(agrupado);
}
