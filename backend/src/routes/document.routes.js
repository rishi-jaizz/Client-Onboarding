const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadDocument, getDocuments, getDocument, deleteDocument } = require('../controllers/document.controller');
const { documentUpload } = require('../middleware/upload');

router.post('/', authenticate, documentUpload.single('document'), uploadDocument);
router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, getDocument);
router.delete('/:id', authenticate, deleteDocument);

module.exports = router;
