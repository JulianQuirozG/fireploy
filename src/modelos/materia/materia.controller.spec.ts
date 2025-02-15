import { Test, TestingModule } from '@nestjs/testing';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';

describe('MateriaController', () => {
  let controller: MateriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateriaController],
      providers: [MateriaService],
    }).compile();

    controller = module.get<MateriaController>(MateriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
