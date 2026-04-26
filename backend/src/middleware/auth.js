const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Verify JWT token and attach client to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token required', 401));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token expired', 401));
      }
      return next(new AppError('Invalid token', 401));
    }

    const client = await prisma.client.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
      },
    });

    if (!client) {
      return next(new AppError('Client not found', 401));
    }

    if (client.status === 'SUSPENDED') {
      return next(new AppError('Account suspended', 403));
    }

    req.client = client;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(new AppError('Authentication failed', 500));
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuthenticate };
