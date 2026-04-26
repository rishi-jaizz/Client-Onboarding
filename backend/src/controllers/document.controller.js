const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');
const { NotFoundError, AppError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @swagger
 * /documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document, documentType]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [ID_CARD, PASSPORT, DRIVING_LICENSE, BUSINESS_REGISTRATION, TAX_DOCUMENT, BANK_STATEMENT, OTHER]
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No document file provided', 400));
    }

    const { documentType } = req.body;

    if (!documentType) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return next(new AppError('Document type is required', 400));
    }

    const validTypes = ['ID_CARD', 'PASSPORT', 'DRIVING_LICENSE', 'BUSINESS_REGISTRATION', 'TAX_DOCUMENT', 'BANK_STATEMENT', 'OTHER'];
    if (!validTypes.includes(documentType)) {
      fs.unlinkSync(req.file.path);
      return next(new AppError(`Invalid document type. Valid types: ${validTypes.join(', ')}`, 400));
    }

    const document = await prisma.document.create({
      data: {
        clientId: req.client.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        documentType,
        status: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        clientId: req.client.id,
        action: 'UPLOAD_DOCUMENT',
        resource: 'document',
        resourceId: document.id,
        ipAddress: req.ip,
        metadata: JSON.stringify({ documentType, fileName: req.file.originalname }),
      },
    });

    logger.info(`Document uploaded: ${document.id} by client ${req.client.id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        ...document,
        downloadUrl: `/uploads/documents/${req.file.filename}`,
      },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @swagger
 * /documents:
 *   get:
 *     tags: [Documents]
 *     summary: Get all documents for the client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 */
const getDocuments = async (req, res, next) => {
  try {
    const { status, documentType } = req.query;

    const where = { clientId: req.client.id };
    if (status) where.status = status;
    if (documentType) where.documentType = documentType;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    const docsWithUrls = documents.map(doc => ({
      ...doc,
      downloadUrl: `/uploads/documents/${doc.fileName}`,
    }));

    res.json({
      success: true,
      data: {
        documents: docsWithUrls,
        total: documents.length,
        summary: {
          pending: documents.filter(d => d.status === 'PENDING').length,
          approved: documents.filter(d => d.status === 'APPROVED').length,
          rejected: documents.filter(d => d.status === 'REJECTED').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get a specific document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 */
const getDocument = async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, clientId: req.client.id },
    });

    if (!document) {
      return next(new NotFoundError('Document'));
    }

    res.json({
      success: true,
      data: {
        ...document,
        downloadUrl: `/uploads/documents/${document.fileName}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document deleted
 */
const deleteDocument = async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, clientId: req.client.id },
    });

    if (!document) {
      return next(new NotFoundError('Document'));
    }

    if (document.status === 'APPROVED') {
      return next(new AppError('Cannot delete an approved document', 400));
    }

    // Delete file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await prisma.document.delete({ where: { id: document.id } });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
