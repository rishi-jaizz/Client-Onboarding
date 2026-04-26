const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

// Mock Prisma
jest.mock('../src/config/database', () => ({
  client: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  onboardingStep: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  clientProfile: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  document: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

const bcrypt = require('bcryptjs');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new client successfully', async () => {
      const mockClient = {
        id: 'test-uuid-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        status: 'PENDING',
        createdAt: new Date(),
      };

      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.create.mockResolvedValue(mockClient);
      prisma.client.update.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.client.email).toBe('test@example.com');
    });

    it('should return 409 if email already exists', async () => {
      prisma.client.findUnique.mockResolvedValue({ id: 'existing-id', email: 'test@example.com' });

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'Test@1234',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 422 for weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(422);
      expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
    });

    it('should return 422 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 12);
      const mockClient = {
        id: 'test-uuid-123',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        status: 'PENDING',
        refreshToken: null,
        onboardingSteps: [],
      };

      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.client.update.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Test@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid credentials', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@example.com', password: 'Wrong@1234' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('Correct@1234', 12);
      prisma.client.findUnique.mockResolvedValue({
        id: 'test-id',
        email: 'test@example.com',
        password: hashedPassword,
        status: 'PENDING',
        onboardingSteps: [],
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Wrong@1234' });

      expect(res.status).toBe(401);
    });

    it('should return 422 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-email', password: 'Test@1234' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 422 if refreshToken is missing', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({});
      expect(res.status).toBe(422);
    });
  });
});

describe('Health Check', () => {
  it('should return 200 for /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
