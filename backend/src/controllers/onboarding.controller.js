const prisma = require('../config/database');
const { NotFoundError, AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @swagger
 * /onboarding/steps:
 *   get:
 *     tags: [Onboarding]
 *     summary: Get all onboarding steps for the client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding steps with progress summary
 */
const getOnboardingSteps = async (req, res, next) => {
  try {
    const steps = await prisma.onboardingStep.findMany({
      where: { clientId: req.client.id },
      orderBy: { stepNumber: 'asc' },
    });

    const completedSteps = steps.filter(s => s.status === 'COMPLETED').length;
    const inProgressSteps = steps.filter(s => s.status === 'IN_PROGRESS').length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const currentStep = steps.find(s => s.status === 'IN_PROGRESS') || steps.find(s => s.status === 'PENDING');

    res.json({
      success: true,
      data: {
        steps,
        summary: {
          totalSteps,
          completedSteps,
          inProgressSteps,
          progress,
          currentStep: currentStep || null,
          isComplete: completedSteps === totalSteps,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /onboarding/steps/{stepNumber}:
 *   get:
 *     tags: [Onboarding]
 *     summary: Get a specific onboarding step
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Onboarding step details
 *       404:
 *         description: Step not found
 */
const getStep = async (req, res, next) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);

    const step = await prisma.onboardingStep.findUnique({
      where: {
        clientId_stepNumber: {
          clientId: req.client.id,
          stepNumber,
        },
      },
    });

    if (!step) {
      return next(new NotFoundError('Onboarding step'));
    }

    res.json({ success: true, data: step });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /onboarding/steps/{stepNumber}:
 *   patch:
 *     tags: [Onboarding]
 *     summary: Update onboarding step status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, SKIPPED]
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Step updated successfully
 */
const updateStep = async (req, res, next) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);
    const { status, metadata } = req.body;

    const step = await prisma.onboardingStep.findUnique({
      where: {
        clientId_stepNumber: {
          clientId: req.client.id,
          stepNumber,
        },
      },
    });

    if (!step) {
      return next(new NotFoundError('Onboarding step'));
    }

    // Validate step transition: can't complete step 2+ if step before is not complete
    if (status === 'IN_PROGRESS' && stepNumber > 1) {
      const prevStep = await prisma.onboardingStep.findUnique({
        where: {
          clientId_stepNumber: { clientId: req.client.id, stepNumber: stepNumber - 1 },
        },
      });
      if (prevStep && prevStep.status === 'PENDING') {
        return next(new AppError('Previous step must be completed or in-progress first', 400));
      }
    }

    const updateData = {
      status,
      metadata: metadata ? JSON.stringify(metadata) : step.metadata,
      completedAt: status === 'COMPLETED' ? new Date() : step.completedAt,
    };

    const updatedStep = await prisma.onboardingStep.update({
      where: {
        clientId_stepNumber: { clientId: req.client.id, stepNumber },
      },
      data: updateData,
    });

    // Update overall client status
    await updateClientStatus(req.client.id);

    await prisma.auditLog.create({
      data: {
        clientId: req.client.id,
        action: 'UPDATE_ONBOARDING_STEP',
        resource: 'onboarding_step',
        resourceId: updatedStep.id,
        ipAddress: req.ip,
        metadata: JSON.stringify({ stepNumber, status }),
      },
    });

    res.json({
      success: true,
      message: `Step ${stepNumber} updated to ${status}`,
      data: updatedStep,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /onboarding/start:
 *   post:
 *     tags: [Onboarding]
 *     summary: Start the onboarding process (mark step 1 as in-progress)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding started
 */
const startOnboarding = async (req, res, next) => {
  try {
    const firstStep = await prisma.onboardingStep.findUnique({
      where: {
        clientId_stepNumber: { clientId: req.client.id, stepNumber: 1 },
      },
    });

    if (!firstStep) {
      return next(new NotFoundError('Onboarding steps'));
    }

    if (firstStep.status !== 'PENDING') {
      return res.json({
        success: true,
        message: 'Onboarding already started',
        data: firstStep,
      });
    }

    const updated = await prisma.onboardingStep.update({
      where: { clientId_stepNumber: { clientId: req.client.id, stepNumber: 1 } },
      data: { status: 'IN_PROGRESS' },
    });

    await prisma.client.update({
      where: { id: req.client.id },
      data: { status: 'IN_PROGRESS' },
    });

    res.json({
      success: true,
      message: 'Onboarding started successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /onboarding/complete-step/{stepNumber}:
 *   post:
 *     tags: [Onboarding]
 *     summary: Complete a step and automatically advance to the next
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Step completed and next step started
 */
const completeStep = async (req, res, next) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);
    const { metadata } = req.body;

    const step = await prisma.onboardingStep.findUnique({
      where: {
        clientId_stepNumber: { clientId: req.client.id, stepNumber },
      },
    });

    if (!step) {
      return next(new NotFoundError('Onboarding step'));
    }

    // Complete current step
    await prisma.onboardingStep.update({
      where: { clientId_stepNumber: { clientId: req.client.id, stepNumber } },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        metadata: metadata ? JSON.stringify(metadata) : step.metadata,
      },
    });

    // Start next step if exists
    let nextStep = null;
    const nextStepRecord = await prisma.onboardingStep.findUnique({
      where: {
        clientId_stepNumber: { clientId: req.client.id, stepNumber: stepNumber + 1 },
      },
    });

    if (nextStepRecord && nextStepRecord.status === 'PENDING') {
      nextStep = await prisma.onboardingStep.update({
        where: { clientId_stepNumber: { clientId: req.client.id, stepNumber: stepNumber + 1 } },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Update overall client status
    await updateClientStatus(req.client.id);

    // Get all steps for response
    const allSteps = await prisma.onboardingStep.findMany({
      where: { clientId: req.client.id },
      orderBy: { stepNumber: 'asc' },
    });

    res.json({
      success: true,
      message: nextStep
        ? `Step ${stepNumber} completed. Moving to step ${stepNumber + 1}.`
        : `Step ${stepNumber} completed. Onboarding complete!`,
      data: {
        completedStep: step,
        nextStep,
        allSteps,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /onboarding/progress:
 *   get:
 *     tags: [Onboarding]
 *     summary: Get onboarding progress summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding progress details
 */
const getProgress = async (req, res, next) => {
  try {
    const [client, steps] = await Promise.all([
      prisma.client.findUnique({
        where: { id: req.client.id },
        select: { status: true, createdAt: true },
      }),
      prisma.onboardingStep.findMany({
        where: { clientId: req.client.id },
        orderBy: { stepNumber: 'asc' },
      }),
    ]);

    const completedSteps = steps.filter(s => s.status === 'COMPLETED').length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const currentStep = steps.find(s => s.status === 'IN_PROGRESS') || steps.find(s => s.status === 'PENDING');

    res.json({
      success: true,
      data: {
        clientStatus: client.status,
        progress,
        completedSteps,
        totalSteps,
        currentStep,
        isComplete: completedSteps === totalSteps,
        startedAt: client.createdAt,
        steps,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper: update overall client status based on step completion
async function updateClientStatus(clientId) {
  const steps = await prisma.onboardingStep.findMany({
    where: { clientId },
    select: { status: true },
  });

  const allCompleted = steps.every(s => s.status === 'COMPLETED' || s.status === 'SKIPPED');
  const anyInProgress = steps.some(s => s.status === 'IN_PROGRESS' || s.status === 'COMPLETED');

  let status = 'PENDING';
  if (allCompleted) status = 'COMPLETED';
  else if (anyInProgress) status = 'IN_PROGRESS';

  await prisma.client.update({
    where: { id: clientId },
    data: { status },
  });
}

module.exports = { getOnboardingSteps, getStep, updateStep, startOnboarding, completeStep, getProgress };
