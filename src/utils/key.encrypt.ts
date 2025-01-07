import * as crypto from 'crypto';

// Função para criptografar uma chave privada
export function encryptPrivateKey(
  privateKey: string,
  password: string,
): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, 'salt', 32);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error('Erro ao criptografar.');
  }
}
