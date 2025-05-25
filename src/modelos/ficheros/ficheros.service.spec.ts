import { Test, TestingModule } from '@nestjs/testing';
import { FicherosService } from './ficheros.service';

describe('FicherosService', () => {
  let service: FicherosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FicherosService],
    }).compile();

    service = module.get<FicherosService>(FicherosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
