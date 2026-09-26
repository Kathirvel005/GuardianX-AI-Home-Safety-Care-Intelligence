import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3Service {
  private client: S3Client | null = null;
  private bucket: string;
  private isConfigured = false;
  private localFiles: Map<string, { buffer: Buffer; contentType: string; createdAt: string }> = new Map();

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'guardianx-event-snapshots';

    if (
      process.env.S3_MODE === 's3' &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      try {
        this.client = new S3Client({
          region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        });
        this.isConfigured = true;
      } catch (err) {
        console.warn('[S3Service] Failed to initialize S3 client:', err);
        this.client = null;
        this.isConfigured = false;
      }
    }
  }

  public getStatus(): {
    status: 'CONNECTED' | 'LOCAL STORAGE' | 'NOT CONFIGURED';
    mode: 's3' | 'local';
    message: string;
    bucket?: string;
    verified: boolean;
  } {
    if (process.env.S3_MODE === 's3') {
      if (this.isConfigured && this.client) {
        return {
          status: 'CONNECTED',
          mode: 's3',
          message: `Connected to S3 Bucket (${this.bucket})`,
          bucket: this.bucket,
          verified: true,
        };
      }
      return {
        status: 'NOT CONFIGURED',
        mode: 's3',
        message: 'S3 mode requested but credentials or initialization failed',
        bucket: this.bucket,
        verified: false,
      };
    }

    return {
      status: 'LOCAL STORAGE',
      mode: 'local',
      message: 'Local storage mock active (snapshots stored in memory)',
      bucket: 'local-memory-store',
      verified: true,
    };
  }

  public async uploadSnapshot(key: string, buffer: Buffer, contentType = 'image/jpeg'): Promise<string> {
    if (this.isConfigured && this.client) {
      try {
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          })
        );
        return `https://${this.bucket}.s3.amazonaws.com/${key}`;
      } catch (err) {
        console.error('[S3Service] Failed to upload to S3, saving to local store:', err);
      }
    }

    this.localFiles.set(key, {
      buffer,
      contentType,
      createdAt: new Date().toISOString(),
    });
    return `/api/snapshots/${key}`;
  }

  public getLocalFile(key: string): { buffer: Buffer; contentType: string } | null {
    const item = this.localFiles.get(key);
    return item ? { buffer: item.buffer, contentType: item.contentType } : null;
  }
}

export const s3Service = new S3Service();
