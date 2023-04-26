import { Test, TestingModule } from '@nestjs/testing';
import { BaseUploadController } from './base.controller';

describe('BaseUploadController', () => {
  let controller: BaseUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseUploadController],
    }).compile();

    controller = module.get<BaseUploadController>(BaseUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
