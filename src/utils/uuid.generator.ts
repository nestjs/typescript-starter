import { randomBytes } from 'crypto';

// Função para gerar UUID
export function generateUUID(): string {
  const buffer = randomBytes(16);

  // Modificar alguns bits para garantir que seja um UUID v4
  buffer[6] = (buffer[6] & 0x0f) | 0x40; // Versão 4
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variante DCE

  // Formatar o buffer como um UUID
  const uuid = buffer.toString('hex');
  return `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20, 32)}`;
}
