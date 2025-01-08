import { Injectable } from '@nestjs/common';
import { generateUUID } from '../utils/uuid.generator';
import { generateKeys } from '../utils/keys.generator';
import { encryptPrivateKey } from '../utils/key.encrypt';

@Injectable()
export class UserService {
  async getUser(): Promise<string> {
    let privateKey: string;

    // Gerar UUID
    const uuid = generateUUID();
    console.log(uuid);

    // Gerar chaves públicas e privadas
    try {
      const { publicKey, privateKey: generatedPrivateKey } =
        await generateKeys(); // Assume que generateKeys() é assíncrona
      console.log(publicKey);
      console.log(generatedPrivateKey);

      privateKey = generatedPrivateKey;
      console.log('Senha Secreta', process.env.PASSWORD);
      // Verificar se privateKey foi gerada corretamente
      if (!privateKey) {
        throw new Error('privateKey não foi definida corretamente.');
      }

      // Encriptar a chave privada
      const encryptedKey = await encryptPrivateKey(
        privateKey,
        process.env.PASSWORD,
      );
      console.log('Chave encriptada após chamada da função', encryptedKey);
    } catch (error) {
      console.error('Erro ao executar consulta', error.message);
      throw new Error(`Erro ao processar as chaves: ${error.message}`);
    }

    return 'SUCCESS';
  }
}
