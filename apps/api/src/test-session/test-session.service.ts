import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TestResultDto } from './dto/test-result.dto';

@Injectable()
export class TestSessionService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId?: string, ipAddress?: string): Promise<any> {
    const serverNode = this.selectBestServer(ipAddress);

    const session = await this.prisma.testSession.create({
      data: {
        userId,
        serverNode: serverNode.id,
        status: 'STARTED',
        ipAddress,
        isp: 'Mock ISP', // In real app, we'd use GeoIP to get ISP
      },
    });

    return {
      sessionId: session.id,
      token: 'mock-session-token', // In real app, sign a JWT for the session
      server: serverNode,
    };
  }

  async submitResult(sessionId: string, metrics: TestResultDto) {
    // 1. Calculate Health Score (Simple Weighted Average)
    // Ping: Lower is better (0-20ms = 100, >200ms = 0)
    // Jitter: Lower is better
    // Loss: Lower is better
    // Speed: Higher is better (but depends on plan, here we just raw score it)

    // Simplified Score: 100 - (Ping/2) - (Jitter) - (PacketLoss * 10)
    // This is just a mock formula for now.
    let score =
      100 - metrics.ping / 5 - metrics.jitter - metrics.packetLoss * 5;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    const healthScore = Math.round(score);

    // 2. Save Result
    const result = await this.prisma.testResult.create({
      data: {
        testSessionId: sessionId,
        downloadSpeed: metrics.download,
        uploadSpeed: metrics.upload,
        ping: metrics.ping,
        jitter: metrics.jitter,
        packetLoss: metrics.packetLoss,
        healthScore: healthScore,
      },
    });

    // 3. Update Session Status
    await this.prisma.testSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', endTime: new Date() },
    });

    return result;
  }

  private selectBestServer(clientIp?: string) {
    // Mock selection logic
    return {
      id: 'bkk-edge-01',
      name: 'Bangkok Edge Server 1',
      url: 'wss://bkk-01.speedtest.example.com',
      location: 'Bangkok, Thailand',
    };
  }
}
