import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm'

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		const dbConfig = this.configService.get('database')
		const syncDB = this.configService.get('env') === 'development' ? true : false
		return {
			name: 'default',
			type: dbConfig.type,
			host: dbConfig.host,
			port: dbConfig.port,
			username: dbConfig.username,
			password: dbConfig.password,
			database: dbConfig.database_name,
			synchronize: syncDB,
			logging: syncDB,
			entities: [process.env.PWD + '/src/model/*.entity{.ts,.js}']
		}
	}
}
