import * as crypto from 'crypto';

export interface EncryptionResult {
  encryptedValue: string;
  iv: string;
  tag: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypts data using AES-256-GCM.
   * @param data The plaintext to encrypt.
   * @param key The 32-byte encryption key.
   */
  static encrypt(data: string, key: Buffer): EncryptionResult {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encryptedValue: encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  /**
   * Decrypts data using AES-256-GCM.
   * @param encryptedValue The hex encrypted value.
   * @param key The 32-byte encryption key.
   * @param iv The hex initialization vector.
   * @param tag The hex authentication tag.
   */
  static decrypt(encryptedValue: string, key: Buffer, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      key,
      Buffer.from(iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generates a secure random 32-byte key.
   */
  static generateKey(): Buffer {
    return crypto.randomBytes(32);
  }
}
