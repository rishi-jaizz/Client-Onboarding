const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errors');

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get client profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await prisma.clientProfile.findUnique({
      where: { clientId: req.client.id },
    });

    if (!profile) {
      return next(new NotFoundError('Profile'));
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update client profile (upsert)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessType:
 *                 type: string
 *               taxId:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               bio:
 *                 type: string
 *               annualRevenue:
 *                 type: string
 *               employeeCount:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
const updateProfile = async (req, res, next) => {
  try {
    const profile = await prisma.clientProfile.upsert({
      where: { clientId: req.client.id },
      update: req.body,
      create: { clientId: req.client.id, ...req.body },
    });

    await prisma.auditLog.create({
      data: {
        clientId: req.client.id,
        action: 'UPDATE_PROFILE',
        resource: 'client_profile',
        resourceId: profile.id,
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /profile/complete:
 *   get:
 *     tags: [Profile]
 *     summary: Get complete client profile with all related data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complete client data
 */
const getCompleteProfile = async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.client.id },
      include: {
        profile: true,
        onboardingSteps: { orderBy: { stepNumber: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    if (!client) {
      return next(new NotFoundError('Client'));
    }

    const { password, refreshToken, ...clientData } = client;

    const completedSteps = client.onboardingSteps.filter(s => s.status === 'COMPLETED').length;
    const totalSteps = client.onboardingSteps.length;

    res.json({
      success: true,
      data: {
        ...clientData,
        onboardingProgress: {
          completedSteps,
          totalSteps,
          progress: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getCompleteProfile };
