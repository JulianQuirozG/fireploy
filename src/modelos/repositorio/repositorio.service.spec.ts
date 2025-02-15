import { Test, TestingModule } from '@nestjs/testing';
import { RepositorioService } from './repositorio.service';

describe('RepositorioService', () => {
  let service: RepositorioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepositorioService],
    }).compile();

    service = module.get<RepositorioService>(RepositorioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
