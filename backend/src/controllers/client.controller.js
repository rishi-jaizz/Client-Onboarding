const prisma = require('../config/database');
const { NotFoundError, AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @swagger
 * /clients/me:
 *   get:
 *     tags: [Clients]
 *     summary: Get current client details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client details
 */
const getClient = async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.client.id },
      include: {
        profile: true,
        onboardingSteps: { orderBy: { stepNumber: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    if (!client) return next(new NotFoundError('Client'));

    const { password, refreshToken, ...data } = client;

    const completedSteps = client.onboardingSteps.filter(s => s.status === 'COMPLETED').length;
    const totalSteps = client.onboardingSteps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...data,
        onboardingProgress: { completedSteps, totalSteps, progress },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /clients/me:
 *   patch:
 *     tags: [Clients]
 *     summary: Update current client basic info
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       200:
 *         description: Client updated successfully
 */
const updateClient = async (req, res, next) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.client.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        industry: true,
        country: true,
        status: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        clientId: req.client.id,
        action: 'UPDATE_CLIENT',
        resource: 'client',
        resourceId: req.client.id,
        ipAddress: req.ip,
        metadata: JSON.stringify({ fields: Object.keys(req.body) }),
      },
    });

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /clients/me:
 *   delete:
 *     tags: [Clients]
 *     summary: Delete current client account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
const deleteClient = async (req, res, next) => {
  try {
    await prisma.client.delete({
      where: { id: req.client.id },
    });

    logger.info(`Client deleted: ${req.client.id}`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /clients/me/upload-image:
 *   post:
 *     tags: [Clients]
 *     summary: Upload profile image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 */
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    const client = await prisma.client.update({
      where: { id: req.client.id },
      data: { profileImage: imageUrl },
      select: { id: true, profileImage: true },
    });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClient, updateClient, deleteClient, uploadProfileImage };
