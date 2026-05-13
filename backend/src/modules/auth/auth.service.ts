import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { authConfig } from '../../config/auth';

function generateTokens(userId: number, rut: string, rolId: number) {
  const accessToken = jwt.sign({ userId, rut, rolId }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn as any,
  });
  const refreshToken = jwt.sign({ userId }, authConfig.jwtRefreshSecret, {
    expiresIn: authConfig.jwtRefreshExpiresIn as any,
  });
  return { accessToken, refreshToken };
}

export async function loginService(rut: string, clave: string) {
  const rutNormalizado = rut.replace(/\./g, '').replace(/\-/g, '').toUpperCase();
  const rutConGuion = rutNormalizado.slice(0, -1) + '-' + rutNormalizado.slice(-1);

  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [{ rut: rutNormalizado }, { rut: rutConGuion }],
      activo: true,
    },
    include: {
      rol: {
        include: {
          permisos: { include: { permiso: true } },
        },
      },
    },
  });

  if (!usuario) throw new Error('Credenciales inválidas');

  const valid = await bcrypt.compare(clave, usuario.claveHash);
  if (!valid) throw new Error('Credenciales inválidas');

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  const tokens = generateTokens(usuario.id, usuario.rut, usuario.rolId);

  return {
    usuario: {
      id: usuario.id,
      rut: usuario.rut,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.nombre,
      rolId: usuario.rolId,
      permisos: usuario.rol.permisos.map((rp: any) => rp.permiso.codigo),
      debeCambiarClave: usuario.debeCambiarClave,
    },
    ...tokens,
  };
}

export async function refreshTokenService(refreshToken: string) {
  const decoded = jwt.verify(refreshToken, authConfig.jwtRefreshSecret) as any;
  const usuario = await prisma.usuario.findUnique({
    where: { id: decoded.userId, activo: true },
    select: { id: true, rut: true, rolId: true },
  });
  if (!usuario) throw new Error('Token inválido');
  return generateTokens(usuario.id, usuario.rut, usuario.rolId);
}

export async function recuperarClaveService(email: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email, activo: true } });
  if (!usuario) return;
  const token = jwt.sign({ userId: usuario.id, type: 'recovery' }, authConfig.jwtSecret, { expiresIn: '24h' });
  console.log(`Token de recuperación para ${email}: ${token}`);
}

export async function cambiarClaveService(userId: number, claveActual: string, claveNueva: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) throw new Error('Usuario no encontrado');

  if (claveActual && claveActual !== 'FORCE_RESET') {
    const valid = await bcrypt.compare(claveActual, usuario.claveHash);
    if (!valid) throw new Error('Clave actual incorrecta');
  }

  const regex = /^[A-Z]\d{4}$/;
  if (!regex.test(claveNueva)) {
    throw new Error('La clave debe ser 1 letra mayúscula y 4 números (ej: A1234)');
  }

  const hash = await bcrypt.hash(claveNueva, authConfig.bcryptRounds);
  await prisma.usuario.update({
    where: { id: userId },
    data: { claveHash: hash, debeCambiarClave: false },
  });
}

export async function getMeService(userId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      rol: {
        include: {
          permisos: { include: { permiso: true } },
        },
      },
    },
  });
  if (!usuario) throw new Error('Usuario no encontrado');
  return {
    id: usuario.id,
    rut: usuario.rut,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol.nombre,
    rolId: usuario.rolId,
    permisos: usuario.rol.permisos.map((rp: any) => rp.permiso.codigo),
    debeCambiarClave: usuario.debeCambiarClave,
  };
}

export async function listarRoles() {
  return prisma.rol.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, nivelPermiso: true },
    orderBy: { nivelPermiso: 'desc' },
  });
}
