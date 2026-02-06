import { Test, TestingModule } from '@nestjs/testing';
import { TestSessionService } from './test-session.service';
import { PrismaService } from '../prisma.service';
import { TestResultDto } from './dto/test-result.dto';

describe('TestSessionService', () => {
  let service: TestSessionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    testSession: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    testResult: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSessionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TestSessionService>(TestSessionService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startSession', () => {
    it('should create a new test session with server info', async () => {
      // Arrange
      const userId = 'test-user-id';
      const ipAddress = '203.113.123.45';
      const mockSession = {
        id: 'session-123',
        userId,
        serverNode: 'bkk-edge-01',
        status: 'STARTED',
        ipAddress,
        isp: 'Mock ISP',
        startTime: new Date(),
        endTime: null,
        createdAt: new Date(),
      };
      mockPrismaService.testSession.create.mockResolvedValue(mockSession);

      // Act
      const result = await service.startSession(userId, ipAddress);

      // Assert
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('server');
      expect(result.server).toHaveProperty('id');
      expect(result.server).toHaveProperty('name');
      expect(result.server).toHaveProperty('url');
      expect(result.server).toHaveProperty('location');
      expect(mockPrismaService.testSession.create).toHaveBeenCalledWith({
        data: {
          userId,
          serverNode: 'bkk-edge-01',
          status: 'STARTED',
          ipAddress,
          isp: 'Mock ISP',
        },
      });
    });

    it('should handle session creation without userId (anonymous)', async () => {
      // Arrange
      const mockSession = {
        id: 'session-456',
        userId: null,
        serverNode: 'bkk-edge-01',
        status: 'STARTED',
        ipAddress: '1.2.3.4',
        isp: 'Mock ISP',
        startTime: new Date(),
        endTime: null,
        createdAt: new Date(),
      };
      mockPrismaService.testSession.create.mockResolvedValue(mockSession);

      // Act
      const result = await service.startSession(undefined, '1.2.3.4');

      // Assert
      expect(result.sessionId).toBe('session-456');
      expect(mockPrismaService.testSession.create).toHaveBeenCalledWith({
        data: {
          userId: undefined,
          serverNode: 'bkk-edge-01',
          status: 'STARTED',
          ipAddress: '1.2.3.4',
          isp: 'Mock ISP',
        },
      });
    });
  });

  describe('submitResult', () => {
    const sessionId = 'session-123';

    it('should calculate health score correctly for good metrics', async () => {
      // Arrange - Good internet metrics
      const metrics: TestResultDto = {
        download: 100,
        upload: 50,
        ping: 10,
        jitter: 2,
        packetLoss: 0,
      };
      const mockResult = {
        id: 'result-1',
        testSessionId: sessionId,
        ...metrics,
        healthScore: 96, // 100 - 10/5 - 2 - 0*5 = 96
        createdAt: new Date(),
      };
      mockPrismaService.testResult.create.mockResolvedValue(mockResult);
      mockPrismaService.testSession.update.mockResolvedValue({});

      // Act
      const result = await service.submitResult(sessionId, metrics);

      // Assert
      expect(result.healthScore).toBe(96);
      expect(mockPrismaService.testResult.create).toHaveBeenCalledWith({
        data: {
          testSessionId: sessionId,
          downloadSpeed: 100,
          uploadSpeed: 50,
          ping: 10,
          jitter: 2,
          packetLoss: 0,
          healthScore: 96,
        },
      });
    });

    it('should calculate health score correctly for poor metrics', async () => {
      // Arrange - Poor internet metrics
      const metrics: TestResultDto = {
        download: 5,
        upload: 2,
        ping: 150,
        jitter: 30,
        packetLoss: 10,
      };
      // Score: 100 - 150/5 - 30 - 10*5 = 100 - 30 - 30 - 50 = -10 -> clamped to 0
      const mockResult = {
        id: 'result-2',
        testSessionId: sessionId,
        ...metrics,
        healthScore: 0,
        createdAt: new Date(),
      };
      mockPrismaService.testResult.create.mockResolvedValue(mockResult);
      mockPrismaService.testSession.update.mockResolvedValue({});

      // Act
      const result = await service.submitResult(sessionId, metrics);

      // Assert
      expect(result.healthScore).toBe(0);
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it('should calculate health score correctly for medium metrics', async () => {
      // Arrange - Medium internet metrics
      const metrics: TestResultDto = {
        download: 50,
        upload: 25,
        ping: 40,
        jitter: 10,
        packetLoss: 2,
      };
      // Score: 100 - 40/5 - 10 - 2*5 = 100 - 8 - 10 - 10 = 72
      const mockResult = {
        id: 'result-3',
        testSessionId: sessionId,
        ...metrics,
        healthScore: 72,
        createdAt: new Date(),
      };
      mockPrismaService.testResult.create.mockResolvedValue(mockResult);
      mockPrismaService.testSession.update.mockResolvedValue({});

      // Act
      const result = await service.submitResult(sessionId, metrics);

      // Assert
      expect(result.healthScore).toBe(72);
    });

    it('should clamp health score to maximum 100', async () => {
      // Arrange - Unrealistically good metrics
      const metrics: TestResultDto = {
        download: 1000,
        upload: 500,
        ping: 1,
        jitter: 0,
        packetLoss: 0,
      };
      // Score: 100 - 1/5 - 0 - 0 = 99.8 -> rounds to 100
      const mockResult = {
        id: 'result-4',
        testSessionId: sessionId,
        ...metrics,
        healthScore: 100,
        createdAt: new Date(),
      };
      mockPrismaService.testResult.create.mockResolvedValue(mockResult);
      mockPrismaService.testSession.update.mockResolvedValue({});

      // Act
      const result = await service.submitResult(sessionId, metrics);

      // Assert
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it('should update session status to COMPLETED after result submission', async () => {
      // Arrange
      const metrics: TestResultDto = {
        download: 50,
        upload: 25,
        ping: 30,
        jitter: 5,
        packetLoss: 1,
      };
      mockPrismaService.testResult.create.mockResolvedValue({
        id: 'result-5',
        testSessionId: sessionId,
        ...metrics,
        healthScore: 80,
        createdAt: new Date(),
      });
      mockPrismaService.testSession.update.mockResolvedValue({});

      // Act
      await service.submitResult(sessionId, metrics);

      // Assert
      expect(mockPrismaService.testSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: { status: 'COMPLETED', endTime: expect.any(Date) },
      });
    });

    it('should handle extreme packet loss correctly', async () => {
      // Arrange - High packet loss
      const metrics: TestResultDto = {
        download: 100,
        upload: 50,
        ping: 20,
        jitter: 5,
        packetLoss: 20, // Very high packet loss
      };
      // Score: 100 - 20/5 - 5 - 20*5 = 100 - 4 - 5 - 100 = -9 -> clamped to 0
      const mockResult = {
        id: 'result-6',
        testSessionId: sessionId,
        ...metrics,
        healthScore: 0,
        createdAt: new Date(),
      };
      mockPrismaService.testResult.create.mockResolvedValue(mockResult);
      mockPrismaService.testSession.update.mockResolvedValue({});

      // Act
      const result = await service.submitResult(sessionId, metrics);

      // Assert
      expect(result.healthScore).toBe(0);
    });
  });

  describe('selectBestServer', () => {
    it('should return a server with required properties', () => {
      // Act
      const server = service['selectBestServer']();

      // Assert
      expect(server).toHaveProperty('id');
      expect(server).toHaveProperty('name');
      expect(server).toHaveProperty('url');
      expect(server).toHaveProperty('location');
      expect(server.id).toBe('bkk-edge-01');
      expect(server.url).toContain('wss://');
    });

    it('should return consistent server for same IP', () => {
      // Act
      const server1 = service['selectBestServer']('203.113.123.45');
      const server2 = service['selectBestServer']('203.113.123.45');

      // Assert
      expect(server1).toEqual(server2);
    });
  });
});
