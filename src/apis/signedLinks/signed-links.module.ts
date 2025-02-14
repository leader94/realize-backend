import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/commonServices/commonServices.module';
import { SignedLinksService } from './signed-links.service';
import { SignedLinksController } from './signed-links.controller';

@Module({
  imports: [CommonModule],
  controllers: [SignedLinksController],
  providers: [SignedLinksService],
})
export class SignedLinksModule {}
