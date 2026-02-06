import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TestSessionService } from './test-session.service';
import type { Request } from 'express';
import { TestResultDto } from './dto/test-result.dto';
// import { AuthGuard } from '@nestjs/passport'; // Optional: if we want to support guests

@Controller('test-session')
export class TestSessionController {
  constructor(private readonly testSessionService: TestSessionService) {}

  @Post('start')
  async startSession(@Req() req: Request) {
    // Check if user is logged in (from AuthGuard if applied, or custom extraction)
    // For now, let's assume userId might be in req.user if protected, or null
    // But since this can be public, we handle extraction manually or use Optional Auth

    const userId = (req as any).user?.userId; // Assuming middleware populates this if present
    const ip = req.ip || req.socket.remoteAddress;

    return this.testSessionService.startSession(userId, ip);
  }

  @Post(':id/result')
  async submitResult(@Param('id') id: string, @Body() body: TestResultDto) {
    return this.testSessionService.submitResult(id, body);
  }
}
