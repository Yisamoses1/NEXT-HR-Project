import * as crypto from 'crypto'

export class PasswordUtil{
    static generateRandomPassword(length: number): string{
        // Use crypto to generate a password 
        return crypto.randomBytes(length).toString('base64').slice(0, length)
    }
}