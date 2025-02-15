import { Test, TestingModule } from '@nestjs/testing';
import { SeccionService } from './seccion.service';

describe('SeccionService', () => {
  let service: SeccionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeccionService],
    }).compile();

    service = module.get<SeccionService>(SeccionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
