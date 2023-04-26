import { Test, TestingModule } from '@nestjs/testing';
import { BaseUploadService } from './base.service';

describe('BaseUploadService', () => {
  let service: BaseUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseUploadService],
    }).compile();

    service = module.get<BaseUploadService>(BaseUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
