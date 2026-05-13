export function generarClaveTemporal(): string {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letra = letras[Math.floor(Math.random() * letras.length)];
  const numeros = Math.floor(1000 + Math.random() * 9000);
  return `${letra}${numeros}`;
}

export function validarFormatoClave(clave: string): boolean {
  return /^[A-Z]\d{4}$/.test(clave);
}
