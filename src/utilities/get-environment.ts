import 'dotenv/config'

export class GetEnvironMent {
  public static isDevelopment() {
    return process.env.ENVIRONMENT === 'development'
  }

  public static isProduction() {
    return process.env.ENVIRONMENT === 'production'
  }
}
