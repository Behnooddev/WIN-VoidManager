import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EncryptionService as CoreEncryption } from '../../../../packages/security/src/index';

@Injectable()
export class EncryptionService {
  // Master Key should come from a secure environment variable or KMS
  private readonly masterKey: Buffer;

  constructor() {
    const keyHex = process.env.MASTER_KEY;
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('MASTER_KEY environment variable must be a 64-character hex string (32 bytes)');
    }
    this.masterKey = Buffer.from(keyHex, 'hex');
  }

  /**
   * Encrypts a value using envelope encryption.
   * 1. Generates a random Data Encryption Key (DEK).
   * 2. Encrypts the value with the DEK.
   * 3. Encrypts the DEK with the Master Key.
   */
  async encryptValue(value: string) {
    try {
      const dek = CoreEncryption.generateKey();
      const encryptedValue = CoreEncryption.encrypt(value, dek);

      // Encrypt the DEK using the Master Key
      const encryptedDek = CoreEncryption.encrypt(dek.toString('hex'), this.masterKey);

      return {
        encryptedValue: encryptedValue.encryptedValue,
        iv: encryptedValue.iv,
        tag: encryptedValue.tag,
        encryptedDek: encryptedDek.encryptedValue,
        dekIv: encryptedDek.iv,
        dekTag: encryptedDek.tag,
      };
    } catch (error) {
      throw new InternalServerErrorException('Encryption failed');
    }
  }

  /**
   * Decrypts a value using envelope encryption.
   */
  async decryptValue(encryptedValue: string, iv: string, tag: string, encryptedDek: string, dekIv: string, dekTag: string) {
    try {
      // 1. Decrypt the DEK using the Master Key
      const dekHex = CoreEncryption.decrypt(encryptedDek, this.masterKey, dekIv, dekTag);
      const dek = Buffer.from(dekHex, 'hex');

      // 2. Decrypt the value using the DEK
      return CoreEncryption.decrypt(encryptedValue, dek, iv, tag);
    } catch (error) {
      throw new InternalServerErrorException('Decryption failed');
    }
  }
}
