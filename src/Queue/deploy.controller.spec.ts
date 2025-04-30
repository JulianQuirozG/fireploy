import { Test, TestingModule } from '@nestjs/testing';
import { DeployController } from './deploy.controller';
import { DeployQueueService } from './Services/deploy.service';

describe('DeployController', () => {
  let controller: DeployController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeployController],
      providers: [DeployQueueService],
    }).compile();

    controller = module.get<DeployController>(DeployController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
