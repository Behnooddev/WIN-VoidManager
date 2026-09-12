import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from '@prisma/client';
import * as qrcode from 'qrcode';

@Injectable()
export class MfaService {
  /**
   * Generates a new TOTP secret for the user.
   */
  async generateMfaSecret(): Promise<{ secret: string; qrCode: string }> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri('VoidManager', 'user@voidroot.com', secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    return { secret, qrCode };
  }

  /**
   * Verifies a TOTP token against a secret.
   */
  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  /**
   * Generates secure recovery codes.
   */
  generateRecoveryCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(require('crypto').randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }
}
