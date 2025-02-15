import { Test, TestingModule } from '@nestjs/testing';
import { RepositorioController } from './repositorio.controller';
import { RepositorioService } from './repositorio.service';

describe('RepositorioController', () => {
  let controller: RepositorioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepositorioController],
      providers: [RepositorioService],
    }).compile();

    controller = module.get<RepositorioController>(RepositorioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
