const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/schemas');
const { getProfile, updateProfile, getCompleteProfile } = require('../controllers/profile.controller');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, validate(updateProfileSchema), updateProfile);
router.get('/complete', authenticate, getCompleteProfile);

module.exports = router;
