import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('TestSession (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create a test user and get auth token
    const testEmail = `e2e-test-session-${Date.now()}@example.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'testpassword123',
      });

    userId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'testpassword123',
      });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.testResult.deleteMany({});
    await prisma.testSession.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        id: userId,
      },
    });
    await app.close();
  });

  describe('/test-sessions/start (POST)', () => {
    it('should start a new test session for authenticated user', () => {
      return request(app.getHttpServer())
        .post('/test-sessions/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('sessionId');
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('server');
          expect(res.body.server).toHaveProperty('id');
          expect(res.body.server).toHaveProperty('name');
          expect(res.body.server).toHaveProperty('url');
          expect(res.body.server).toHaveProperty('location');
        });
    });

    it('should start a new test session for anonymous user', () => {
      return request(app.getHttpServer())
        .post('/test-sessions/start')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('sessionId');
          expect(res.body).toHaveProperty('server');
        });
    });

    it('should return 401 when using invalid token', () => {
      return request(app.getHttpServer())
        .post('/test-sessions/start')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/test-sessions/:id/submit (POST)', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a new session before each test
      const res = await request(app.getHttpServer())
        .post('/test-sessions/start')
        .set('Authorization', `Bearer ${accessToken}`);

      sessionId = res.body.sessionId;
    });

    it('should submit test results and calculate health score', () => {
      const testMetrics = {
        download: 100,
        upload: 50,
        ping: 20,
        jitter: 5,
        packetLoss: 0,
      };

      return request(app.getHttpServer())
        .post(`/test-sessions/${sessionId}/submit`)
        .send(testMetrics)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('healthScore');
          expect(res.body.healthScore).toBeGreaterThanOrEqual(0);
          expect(res.body.healthScore).toBeLessThanOrEqual(100);
          expect(res.body.downloadSpeed).toBe(testMetrics.download);
          expect(res.body.uploadSpeed).toBe(testMetrics.upload);
          expect(res.body.ping).toBe(testMetrics.ping);
          expect(res.body.jitter).toBe(testMetrics.jitter);
          expect(res.body.packetLoss).toBe(testMetrics.packetLoss);
        });
    });

    it('should calculate low health score for poor metrics', () => {
      const poorMetrics = {
        download: 5,
        upload: 2,
        ping: 150,
        jitter: 30,
        packetLoss: 10,
      };

      return request(app.getHttpServer())
        .post(`/test-sessions/${sessionId}/submit`)
        .send(poorMetrics)
        .expect(201)
        .expect((res) => {
          expect(res.body.healthScore).toBeLessThan(30);
        });
    });

    it('should calculate high health score for excellent metrics', () => {
      const excellentMetrics = {
        download: 200,
        upload: 100,
        ping: 5,
        jitter: 1,
        packetLoss: 0,
      };

      return request(app.getHttpServer())
        .post(`/test-sessions/${sessionId}/submit`)
        .send(excellentMetrics)
        .expect(201)
        .expect((res) => {
          expect(res.body.healthScore).toBeGreaterThan(90);
        });
    });

    it('should return 400 when metrics are missing', () => {
      return request(app.getHttpServer())
        .post(`/test-sessions/${sessionId}/submit`)
        .send({
          download: 100,
          // Missing other required fields
        })
        .expect(400);
    });

    it('should return 404 when session does not exist', () => {
      const testMetrics = {
        download: 100,
        upload: 50,
        ping: 20,
        jitter: 5,
        packetLoss: 0,
      };

      return request(app.getHttpServer())
        .post('/test-sessions/non-existent-id/submit')
        .send(testMetrics)
        .expect(404);
    });
  });

  describe('Complete test session flow', () => {
    it('should complete full test session lifecycle', async () => {
      // Step 1: Start session
      const startRes = await request(app.getHttpServer())
        .post('/test-sessions/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      const { sessionId } = startRes.body;

      // Step 2: Submit results
      const metrics = {
        download: 75,
        upload: 40,
        ping: 25,
        jitter: 8,
        packetLoss: 1,
      };

      const submitRes = await request(app.getHttpServer())
        .post(`/test-sessions/${sessionId}/submit`)
        .send(metrics)
        .expect(201);

      // Verify result has valid health score
      expect(submitRes.body.healthScore).toBeGreaterThanOrEqual(0);
      expect(submitRes.body.healthScore).toBeLessThanOrEqual(100);

      // Step 3: Verify session was updated to COMPLETED
      const session = await prisma.testSession.findUnique({
        where: { id: sessionId },
      });

      expect(session).toBeDefined();
      expect(session?.status).toBe('COMPLETED');
      expect(session?.endTime).toBeDefined();
    });
  });
});
