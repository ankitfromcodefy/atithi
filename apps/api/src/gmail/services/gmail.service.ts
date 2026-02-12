import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1 } from 'googleapis';

@Injectable()
export class GmailService implements OnModuleInit {
  private readonly logger = new Logger(GmailService.name);
  private oauth2Client!: InstanceType<typeof google.auth.OAuth2>;
  private gmail!: gmail_v1.Gmail;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    const apiUrl = this.configService.get<string>('API_URL');
    if (apiUrl) {
      this.redirectUri = `${apiUrl}/v1/auth/google/callback`;
    } else {
      const port = this.configService.get<string>('PORT', '3001');
      this.redirectUri = `http://localhost:${port}/v1/auth/google/callback`;
    }
  }

  onModuleInit() {
    const clientId = this.configService.get<string>('GMAIL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GMAIL_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      this.redirectUri,
    );

    if (refreshToken) {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
    });
  }

  async exchangeCode(
    code: string,
  ): Promise<{ refreshToken: string | null | undefined }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    return { refreshToken: tokens.refresh_token };
  }

  async activateWatch(): Promise<{ historyId: string; expiration: string }> {
    const projectId = this.configService.get<string>('GCP_PROJECT_ID');
    const res = await this.gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${projectId}/topics/atithi-incoming-emails`,
        labelIds: ['INBOX'],
      },
    });
    return {
      historyId: String(res.data.historyId),
      expiration: String(res.data.expiration),
    };
  }

  async fetchHistory(
    startHistoryId: string,
  ): Promise<{ messageIds: string[]; latestHistoryId: string }> {
    const res = await this.gmail.users.history.list({
      userId: 'me',
      startHistoryId,
      historyTypes: ['messageAdded'],
    });

    const messageIds: string[] = [];
    if (res.data.history) {
      for (const record of res.data.history) {
        if (record.messagesAdded) {
          for (const added of record.messagesAdded) {
            if (added.message?.id) {
              messageIds.push(added.message.id);
            }
          }
        }
      }
    }

    return {
      messageIds,
      latestHistoryId: String(res.data.historyId ?? startHistoryId),
    };
  }

  async fetchMessage(messageId: string): Promise<gmail_v1.Schema$Message> {
    const res = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    return res.data;
  }

  async getProfile(): Promise<{ historyId: string; emailAddress: string }> {
    const res = await this.gmail.users.getProfile({ userId: 'me' });
    return {
      historyId: String(res.data.historyId),
      emailAddress: res.data.emailAddress ?? '',
    };
  }
}
