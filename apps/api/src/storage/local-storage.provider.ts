import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { StorageProvider } from './storage.provider';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly storageRoot = path.resolve(__dirname, '../../../../infrastructure/storage');

  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    await fs.mkdir(this.storageRoot, { recursive: true });

    // Randomized storage identifier to prevent predictability and path traversal
    const storageKey = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.bin`;
    const filePath = path.join(this.storageRoot, storageKey);

    await fs.writeFile(filePath, file);
    return storageKey;
  }

  async download(storageKey: string): Promise<Readable> {
    const filePath = path.join(this.storageRoot, storageKey);

    // Basic path traversal check
    if (!filePath.startsWith(this.storageRoot)) {
      throw new Error('Invalid storage key');
    }

    return createReadStream(filePath);
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.storageRoot, storageKey);
    if (!filePath.startsWith(this.storageRoot)) {
      throw new Error('Invalid storage key');
    }
    await fs.unlink(filePath);
  }

  async getSignedUrl(storageKey: string, expiresIn: number): Promise<string> {
    // Local storage doesn't have "signed URLs" in the cloud sense.
    // We return the storageKey, and the API will stream the file.
    return `/documents/download/${storageKey}`;
  }
}
