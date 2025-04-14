import { Test, TestingModule } from '@nestjs/testing';
import { DeployQueueService } from './Services/deploy.service';

describe('DeployService', () => {
  let service: DeployQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployQueueService],
    }).compile();

    service = module.get<DeployQueueService>(DeployQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
