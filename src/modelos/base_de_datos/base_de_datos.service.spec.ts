import { Test, TestingModule } from '@nestjs/testing';
import { BaseDeDatosService } from './base_de_datos.service';

describe('BaseDeDatosService', () => {
  let service: BaseDeDatosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseDeDatosService],
    }).compile();

    service = module.get<BaseDeDatosService>(BaseDeDatosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
