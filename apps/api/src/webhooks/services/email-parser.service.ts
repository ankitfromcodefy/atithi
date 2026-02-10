import { Injectable, Logger } from '@nestjs/common';
import { convert } from 'html-to-text';
import { gmail_v1 } from 'googleapis';

export interface ParsedEmail {
  senderName: string | null;
  senderEmail: string;
  subject: string | null;
  body: string;
  cc: string[];
  hasAttachments: boolean;
  inReplyTo: string | null;
  messageIdHeader: string | null;
  isForwarded: boolean;
}

@Injectable()
export class EmailParserService {
  private readonly logger = new Logger(EmailParserService.name);

  async parse(gmailMessage: gmail_v1.Schema$Message): Promise<ParsedEmail> {
    const headers = gmailMessage.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
        ?.value ?? null;

    const from = getHeader('From') ?? '';
    const { name: senderName, email: senderEmail } =
      this.parseFromHeader(from);
    const subject = getHeader('Subject');
    const inReplyTo = getHeader('In-Reply-To');
    const messageIdHeader = getHeader('Message-ID');
    const cc = this.parseCcHeader(getHeader('Cc'));

    const isForwarded = this.checkIsForwarded(subject);
    const hasAttachments = this.checkHasAttachments(gmailMessage.payload);

    // Extract body from MIME parts
    const rawBody = this.extractBody(gmailMessage.payload);
    const body = isForwarded ? rawBody : this.stripQuotedContent(rawBody);

    return {
      senderName,
      senderEmail,
      subject,
      body,
      cc,
      hasAttachments,
      inReplyTo,
      messageIdHeader,
      isForwarded,
    };
  }

  private parseFromHeader(from: string): {
    name: string | null;
    email: string;
  } {
    const match = from.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+@[^>]+)>?$/);
    if (match) {
      return {
        name: match[1]?.trim() || null,
        email: match[2].trim().toLowerCase(),
      };
    }
    return { name: null, email: from.trim().toLowerCase() };
  }

  private parseCcHeader(cc: string | null): string[] {
    if (!cc) return [];
    return cc.split(',').map((addr) => {
      const match = addr.match(/<([^>]+)>/);
      return (match ? match[1] : addr).trim().toLowerCase();
    });
  }

  private checkIsForwarded(subject: string | null): boolean {
    if (!subject) return false;
    const lower = subject.toLowerCase();
    return lower.startsWith('fwd:') || lower.includes('forwarded');
  }

  private checkHasAttachments(
    payload: gmail_v1.Schema$MessagePart | undefined,
  ): boolean {
    if (!payload) return false;
    if (payload.filename && payload.filename.length > 0) return true;
    if (payload.parts) {
      return payload.parts.some((part) => this.checkHasAttachments(part));
    }
    return false;
  }

  private extractBody(
    payload: gmail_v1.Schema$MessagePart | undefined,
  ): string {
    if (!payload) return '';

    if (!payload.parts) {
      if (payload.body?.data) {
        const decoded = Buffer.from(payload.body.data, 'base64url').toString(
          'utf-8',
        );
        if (payload.mimeType === 'text/plain') {
          return decoded;
        }
        if (payload.mimeType === 'text/html') {
          return convert(decoded, { wordwrap: false });
        }
      }
      return '';
    }

    let plainText = '';
    let htmlText = '';

    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plainText = Buffer.from(part.body.data, 'base64url').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        htmlText = Buffer.from(part.body.data, 'base64url').toString('utf-8');
      } else if (part.mimeType?.startsWith('multipart/') && part.parts) {
        const nested = this.extractBody(part);
        if (nested) return nested;
      }
    }

    if (plainText) return plainText;
    if (htmlText) return convert(htmlText, { wordwrap: false });
    return '';
  }

  private stripQuotedContent(body: string): string {
    const lines = body.split('\n');
    const result: string[] = [];

    for (const line of lines) {
      if (/^On .+ wrote:\s*$/.test(line)) break;
      if (line.startsWith('>')) break;
      if (line.startsWith('-------- Original Message --------')) break;
      if (/^From:.+/.test(line) && !result.length) {
        continue;
      }
      result.push(line);
    }

    return result.join('\n').trim();
  }
}
