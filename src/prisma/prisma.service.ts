import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor (config: ConfigService) {
        super({
            datasources: {
                db: {
                    url:config.get("DATABASE_URL")
                }
            }
        })
        console.log(config.get("DATABASE_URL"))
    }
}
