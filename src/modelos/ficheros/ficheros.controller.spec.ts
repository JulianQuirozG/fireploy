import { Test, TestingModule } from '@nestjs/testing';
import { FicherosController } from './ficheros.controller';
import { FicherosService } from './ficheros.service';

describe('FicherosController', () => {
  let controller: FicherosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FicherosController],
      providers: [FicherosService],
    }).compile();

    controller = module.get<FicherosController>(FicherosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
