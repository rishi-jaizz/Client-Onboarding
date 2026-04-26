const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const { AppError, ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

// Onboarding steps template
const ONBOARDING_STEPS = [
  {
    stepNumber: 1,
    stepType: 'DOCUMENT_UPLOAD',
    title: 'Document Upload',
    description: 'Upload required identity and business documents',
  },
  {
    stepNumber: 2,
    stepType: 'IDENTITY_VERIFICATION',
    title: 'Identity Verification',
    description: 'Verify your identity and business information',
  },
  {
    stepNumber: 3,
    stepType: 'BUSINESS_SETUP',
    title: 'Business Setup',
    description: 'Configure your business profile and preferences',
  },
  {
    stepNumber: 4,
    stepType: 'REVIEW_AND_CONFIRM',
    title: 'Review & Confirm',
    description: 'Review all information and confirm onboarding',
  },
];

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new client
 *     description: Creates a new client account and initializes the onboarding workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client registered successfully
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 */
const signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, company, industry, country } = req.body;

    // Check for existing client
    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return next(new ConflictError('Email already registered'));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create client with onboarding steps and profile
    const client = await prisma.client.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        company,
        industry,
        country,
        status: 'PENDING',
        profile: {
          create: {},
        },
        onboardingSteps: {
          create: ONBOARDING_STEPS,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(client.id);

    // Save refresh token
    await prisma.client.update({
      where: { id: client.id },
      data: { refreshToken },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        clientId: client.id,
        action: 'SIGNUP',
        resource: 'client',
        resourceId: client.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`New client registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        client,
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find client
    const client = await prisma.client.findUnique({
      where: { email },
      include: {
        onboardingSteps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!client) {
      return next(new UnauthorizedError('Invalid email or password'));
    }

    if (client.status === 'SUSPENDED') {
      return next(new UnauthorizedError('Account suspended. Contact support.'));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      return next(new UnauthorizedError('Invalid email or password'));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(client.id);

    // Save refresh token
    await prisma.client.update({
      where: { id: client.id },
      data: { refreshToken },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        clientId: client.id,
        action: 'LOGIN',
        resource: 'client',
        resourceId: client.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    const { password: _, refreshToken: __, ...clientData } = client;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        client: clientData,
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return next(new UnauthorizedError('Invalid or expired refresh token'));
    }

    const client = await prisma.client.findUnique({
      where: { id: decoded.sub },
      select: { id: true, refreshToken: true, status: true },
    });

    if (!client || client.refreshToken !== token) {
      return next(new UnauthorizedError('Invalid refresh token'));
    }

    if (client.status === 'SUSPENDED') {
      return next(new UnauthorizedError('Account suspended'));
    }

    const accessToken = generateAccessToken(client.id);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout a client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
const logout = async (req, res, next) => {
  try {
    await prisma.client.update({
      where: { id: req.client.id },
      data: { refreshToken: null },
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current client data
 *       401:
 *         description: Not authenticated
 */
const getMe = async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.client.id },
      include: {
        profile: true,
        onboardingSteps: {
          orderBy: { stepNumber: 'asc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!client) {
      return next(new NotFoundError('Client'));
    }

    const { password, refreshToken, ...clientData } = client;

    // Calculate onboarding progress
    const completedSteps = client.onboardingSteps.filter(s => s.status === 'COMPLETED').length;
    const totalSteps = client.onboardingSteps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...clientData,
        onboardingProgress: { completedSteps, totalSteps, progress },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change client password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password incorrect
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const client = await prisma.client.findUnique({
      where: { id: req.client.id },
      select: { id: true, password: true },
    });

    const isValid = await bcrypt.compare(currentPassword, client.password);
    if (!isValid) {
      return next(new UnauthorizedError('Current password is incorrect'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.client.update({
      where: { id: req.client.id },
      data: { password: hashedPassword, refreshToken: null },
    });

    await prisma.auditLog.create({
      data: {
        clientId: req.client.id,
        action: 'PASSWORD_CHANGE',
        resource: 'client',
        resourceId: req.client.id,
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, refreshToken, logout, getMe, changePassword };
