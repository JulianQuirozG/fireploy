import { Test, TestingModule } from '@nestjs/testing';
import { SeccionController } from './seccion.controller';
import { SeccionService } from './seccion.service';

describe('SeccionController', () => {
  let controller: SeccionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeccionController],
      providers: [SeccionService],
    }).compile();

    controller = module.get<SeccionController>(SeccionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
