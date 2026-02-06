import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SpeedTestController } from './speed-test/speed-test.controller';
import { SpeedTestGateway } from './speed-test/speed-test.gateway';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, SpeedTestController],
  providers: [AppService, SpeedTestGateway],
})
export class AppModule {}
