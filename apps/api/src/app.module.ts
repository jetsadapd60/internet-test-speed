import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TestSessionModule } from './test-session/test-session.module';

import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';

import { SpeedTestController } from './speed-test/speed-test.controller';
import { SpeedTestGateway } from './speed-test/speed-test.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TestSessionModule,
  ],
  controllers: [AppController, SpeedTestController],
  providers: [AppService, SpeedTestGateway],
})
export class AppModule {}
