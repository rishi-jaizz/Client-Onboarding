const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const jwt = require('jsonwebtoken');

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

// Generate a valid test token
const generateTestToken = (clientId = 'test-client-id') => {
  return jwt.sign(
    { sub: clientId, type: 'access' },
    process.env.JWT_SECRET || 'dev-super-secret-jwt-key-at-least-32-characters-long',
    { expiresIn: '1h' }
  );
};

const mockClient = {
  id: 'test-client-id',
  email: 'test@example.com',
  firstName: 'John',
  status: 'IN_PROGRESS',
  emailVerified: true,
};

const mockSteps = [
  { id: 'step-1', clientId: 'test-client-id', stepNumber: 1, stepType: 'DOCUMENT_UPLOAD', title: 'Document Upload', status: 'COMPLETED', completedAt: new Date() },
  { id: 'step-2', clientId: 'test-client-id', stepNumber: 2, stepType: 'IDENTITY_VERIFICATION', title: 'Identity Verification', status: 'IN_PROGRESS', completedAt: null },
  { id: 'step-3', clientId: 'test-client-id', stepNumber: 3, stepType: 'BUSINESS_SETUP', title: 'Business Setup', status: 'PENDING', completedAt: null },
  { id: 'step-4', clientId: 'test-client-id', stepNumber: 4, stepType: 'REVIEW_AND_CONFIRM', title: 'Review & Confirm', status: 'PENDING', completedAt: null },
];

describe('Onboarding API', () => {
  let token;

  beforeAll(() => {
    token = generateTestToken();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.client.findUnique.mockResolvedValue(mockClient);
  });

  describe('GET /api/v1/onboarding/steps', () => {
    it('should return all onboarding steps', async () => {
      prisma.onboardingStep.findMany.mockResolvedValue(mockSteps);

      const res = await request(app)
        .get('/api/v1/onboarding/steps')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.steps).toHaveLength(4);
      expect(res.body.data.summary.completedSteps).toBe(1);
      expect(res.body.data.summary.progress).toBe(25);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/onboarding/steps');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/onboarding/progress', () => {
    it('should return progress summary', async () => {
      prisma.client.findUnique
        .mockResolvedValueOnce(mockClient) // auth middleware
        .mockResolvedValueOnce({ status: 'IN_PROGRESS', createdAt: new Date() }); // progress query
      prisma.onboardingStep.findMany.mockResolvedValue(mockSteps);

      const res = await request(app)
        .get('/api/v1/onboarding/progress')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('progress');
      expect(res.body.data).toHaveProperty('completedSteps');
      expect(res.body.data).toHaveProperty('isComplete');
    });
  });

  describe('POST /api/v1/onboarding/start', () => {
    it('should start onboarding for pending first step', async () => {
      const pendingStep = { ...mockSteps[0], status: 'PENDING' };
      prisma.onboardingStep.findUnique.mockResolvedValue(pendingStep);
      prisma.onboardingStep.update.mockResolvedValue({ ...pendingStep, status: 'IN_PROGRESS' });
      prisma.client.update.mockResolvedValue({ ...mockClient, status: 'IN_PROGRESS' });

      const res = await request(app)
        .post('/api/v1/onboarding/start')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/onboarding/steps/:stepNumber', () => {
    it('should update step status', async () => {
      const step = mockSteps[1]; // IN_PROGRESS step
      prisma.onboardingStep.findUnique.mockResolvedValue(step);
      prisma.onboardingStep.update.mockResolvedValue({ ...step, status: 'COMPLETED', completedAt: new Date() });
      prisma.onboardingStep.findMany.mockResolvedValue(mockSteps);
      prisma.client.update.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .patch('/api/v1/onboarding/steps/2')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 422 for invalid status', async () => {
      const res = await request(app)
        .patch('/api/v1/onboarding/steps/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(422);
    });
  });
});
