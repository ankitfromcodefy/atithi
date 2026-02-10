import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { GmailService } from '../services/gmail.service';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(private readonly gmailService: GmailService) {}

  @Get()
  startOAuth(@Res() reply: FastifyReply) {
    const url = this.gmailService.getAuthUrl();
    return reply.redirect(url);
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Res() reply: FastifyReply,
  ) {
    const { refreshToken } = await this.gmailService.exchangeCode(code);

    this.logger.log('=== GMAIL OAUTH COMPLETE ===');
    this.logger.log(`Refresh Token: ${refreshToken}`);
    this.logger.log('Add this to your .env as GMAIL_REFRESH_TOKEN');
    this.logger.log('============================');

    return reply.send({
      message: 'OAuth complete. Check server logs for refresh token.',
      refreshToken,
    });
  }
}
