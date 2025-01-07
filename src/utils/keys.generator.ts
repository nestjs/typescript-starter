import { generateKeyPairSync } from 'crypto';

// Definir o tipo do retorno como um objeto com as chaves pública e privada como strings
export function generateKeys(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, // Tamanho da chave em bits
    publicKeyEncoding: {
      type: 'spki', // formato da chave pública
      format: 'pem', // formato PEM para a chave pública
    },
    privateKeyEncoding: {
      type: 'pkcs8', // formato da chave privada
      format: 'pem', // formato PEM para a chave privada
    },
  });

  // Retorna um objeto com as chaves
  return { publicKey, privateKey };
}
