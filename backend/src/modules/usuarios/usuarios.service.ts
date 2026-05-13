import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';

function generarClaveTemporal(): string {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letra = letras[Math.floor(Math.random() * letras.length)];
  const numeros = Math.floor(1000 + Math.random() * 9000);
  return `${letra}${numeros}`;
}

function normalizarRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/\-/g, '').toUpperCase();
}

export async function listar() {
  return prisma.usuario.findMany({
    where: { activo: true },
    select: {
      id: true, rut: true, nombre: true, email: true,
      rolId: true, telefono: true, activo: true,
      ultimoAcceso: true, debeCambiarClave: true,
      fechaCreacion: true,
    },
    orderBy: { nombre: 'asc' },
  });
}

export async function obtener(id: number) {
  const u = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true, rut: true, nombre: true, email: true,
      rolId: true, telefono: true, activo: true,
      ultimoAcceso: true, debeCambiarClave: true,
    },
  });
  if (!u) throw new Error('Usuario no encontrado');
  return u;
}

export async function crear(data: any, creadoPor: number) {
  const rut = normalizarRut(data.rut);
  const claveTemporal = data.clave || generarClaveTemporal();
  const hash = await bcrypt.hash(claveTemporal, authConfig.bcryptRounds);

  return prisma.usuario.create({
    data: {
      rut,
      nombre: data.nombre,
      email: data.email,
      claveHash: hash,
      rolId: data.rolId,
      telefono: data.telefono,
      debeCambiarClave: true,
      creadoPor,
    },
    select: {
      id: true, rut: true, nombre: true, email: true,
      rolId: true, activo: true, debeCambiarClave: true,
      fechaCreacion: true,
    },
  });
}

export async function actualizar(id: number, data: any, actualizadoPor: number) {
  const updateData: any = {
    nombre: data.nombre,
    email: data.email,
    rolId: data.rolId,
    telefono: data.telefono,
    actualizadoPor,
  };

  if (data.activo !== undefined) updateData.activo = data.activo;

  return prisma.usuario.update({
    where: { id },
    data: updateData,
    select: {
      id: true, rut: true, nombre: true, email: true,
      rolId: true, activo: true, fechaActualizacion: true,
    },
  });
}

export async function desactivar(id: number, actualizadoPor: number) {
  return prisma.usuario.update({
    where: { id },
    data: { activo: false, actualizadoPor },
    select: { id: true, activo: true },
  });
}
