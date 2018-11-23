import 'jest-extended';

import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';

import { ConfigService, EnvConfig } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();
    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fail with an invalid config', async () => {
    const invalidEnv: EnvConfig = { NODE_ENV: 'invalid' };
    expect(() => (service as any).validateInput(invalidEnv)).toThrowWithMessage(
      Error,
      /^Config validation error:/,
    );
  });

  it('should be able to read a .env file', () => {
    const filePath = 'sample.env';
    if (fs.existsSync(filePath)) {
      expect((service as any).readEnvFromFile(filePath)).toBeObject();
    }
  });

  describe('should expose configuration properties', () => {
    it('should check for dev environment', () => {
      expect(service.isDevEnvironment).toBeFalse();
    });

    it('should check for production environment', () => {
      expect(service.isProdEnvironment).toBeFalse();
    });

    it('should check for test environment', () => {
      expect(service.isTestEnvironment).toBeTrue();
    });

    it('should expose a port number', () => {
      expect(service.port).toBeNumber();
    });
  });
});
