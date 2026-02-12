import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import { GmailService } from '../services/gmail.service';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  startOAuth(@Res() reply: FastifyReply) {
    const url = this.gmailService.getAuthUrl();
    return reply.status(302).redirect(url);
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Res() reply: FastifyReply,
  ) {
    const { refreshToken } = await this.gmailService.exchangeCode(code);

    this.logger.log('=== GMAIL OAUTH COMPLETE ===');
    this.logger.log(`Refresh Token: ${refreshToken}`);
    this.logger.log('============================');

    const frontendUrl = this.configService.get<string>(
      'CORS_ORIGINS',
      'http://localhost:3000',
    );
    return reply.status(302).redirect(`${frontendUrl}?gmail=connected`);
  }
}
