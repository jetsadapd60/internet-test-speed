import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { WsAdapter } from '@nestjs/platform-ws';

import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useWebSocketAdapter(new WsAdapter(app));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}`);
}
void bootstrap();
