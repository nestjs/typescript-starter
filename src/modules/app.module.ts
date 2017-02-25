import { Module } from 'nest.js';
import { UsersModule } from './users/users.module';

@Module({
    modules: [ UsersModule ]
})
export class ApplicationModule {}