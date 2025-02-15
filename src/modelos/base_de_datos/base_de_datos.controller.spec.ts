import { Test, TestingModule } from '@nestjs/testing';
import { BaseDeDatosController } from './base_de_datos.controller';
import { BaseDeDatosService } from './base_de_datos.service';

describe('BaseDeDatosController', () => {
  let controller: BaseDeDatosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseDeDatosController],
      providers: [BaseDeDatosService],
    }).compile();

    controller = module.get<BaseDeDatosController>(BaseDeDatosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
