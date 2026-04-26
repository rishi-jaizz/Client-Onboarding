const jwt = require('jsonwebtoken');

/**
 * Generate an access token
 * @param {string} clientId
 * @returns {string}
 */
const generateAccessToken = (clientId) => {
  return jwt.sign(
    { sub: clientId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate a refresh token
 * @param {string} clientId
 * @returns {string}
 */
const generateRefreshToken = (clientId) => {
  return jwt.sign(
    { sub: clientId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * Verify a refresh token
 * @param {string} token
 * @returns {object}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Generate both tokens
 * @param {string} clientId
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (clientId) => {
  return {
    accessToken: generateAccessToken(clientId),
    refreshToken: generateRefreshToken(clientId),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenPair,
};
