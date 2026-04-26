const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateClientSchema } = require('../validators/schemas');
const { getClient, updateClient, deleteClient, uploadProfileImage } = require('../controllers/client.controller');
const { profileImageUpload } = require('../middleware/upload');

router.get('/me', authenticate, getClient);
router.patch('/me', authenticate, validate(updateClientSchema), updateClient);
router.delete('/me', authenticate, deleteClient);
router.post('/me/upload-image', authenticate, profileImageUpload.single('image'), uploadProfileImage);

module.exports = router;
