import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

export interface StorageProvider {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  download(storageKey: string): Promise<Readable>;
  delete(storageKey: string): Promise<void>;
  getSignedUrl(storageKey: string, expiresIn: number): Promise<string>;
}
