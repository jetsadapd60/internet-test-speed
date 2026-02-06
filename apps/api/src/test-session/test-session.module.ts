import { Module } from '@nestjs/common';
import { TestSessionService } from './test-session.service';
import { TestSessionController } from './test-session.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TestSessionController],
  providers: [TestSessionService, PrismaService],
})
export class TestSessionModule {}
