import * as crypto from 'crypto';

export class PasswordUtil {
  static generateRandomPassword(length: number): string {

    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }
}
