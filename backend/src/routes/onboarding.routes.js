const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateStepSchema } = require('../validators/schemas');
const {
  getOnboardingSteps,
  getStep,
  updateStep,
  startOnboarding,
  completeStep,
  getProgress,
} = require('../controllers/onboarding.controller');

router.get('/steps', authenticate, getOnboardingSteps);
router.get('/steps/:stepNumber', authenticate, getStep);
router.patch('/steps/:stepNumber', authenticate, validate(updateStepSchema), updateStep);
router.post('/start', authenticate, startOnboarding);
router.post('/complete-step/:stepNumber', authenticate, completeStep);
router.get('/progress', authenticate, getProgress);

module.exports = router;
