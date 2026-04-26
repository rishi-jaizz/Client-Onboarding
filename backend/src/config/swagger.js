const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Onboarding API',
      version: '1.0.0',
      description: `
# Client Onboarding API

A complete REST API for client registration, authentication, and multi-step onboarding workflow.

## Features
- **JWT Authentication** with refresh tokens
- **Multi-step Onboarding** (4 steps: Document Upload → Identity Verification → Business Setup → Review)
- **File Upload** support for documents
- **Profile Management** with full CRUD
- **Role-based access control** ready
- **Comprehensive validation** with Zod

## Authentication
All protected endpoints require a Bearer token:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@clientonboarding.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://api.clientonboarding.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string', nullable: true },
            company: { type: 'string', nullable: true },
            industry: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SUSPENDED'] },
            emailVerified: { type: 'boolean' },
            profileImage: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OnboardingStep: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            stepNumber: { type: 'integer', minimum: 1, maximum: 4 },
            stepType: { type: 'string', enum: ['DOCUMENT_UPLOAD', 'IDENTITY_VERIFICATION', 'BUSINESS_SETUP', 'REVIEW_AND_CONFIRM'] },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'] },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            fileName: { type: 'string' },
            originalName: { type: 'string' },
            mimeType: { type: 'string' },
            fileSize: { type: 'integer' },
            documentType: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Clients', description: 'Client management' },
      { name: 'Profile', description: 'Profile management' },
      { name: 'Onboarding', description: 'Onboarding workflow' },
      { name: 'Documents', description: 'Document upload and management' },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

module.exports = swaggerJsdoc(options);
