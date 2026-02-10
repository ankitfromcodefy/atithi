import { Module } from '@nestjs/common';
import { GmailService } from './services/gmail.service';
import { GoogleAuthController } from './controllers/google-auth.controller';

@Module({
  controllers: [GoogleAuthController],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule {}
