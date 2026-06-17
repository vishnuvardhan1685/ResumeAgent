// src/utils/generateTokens.js
// Export two functions:

// generateAccessToken(userId) → jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' })
// generateRefreshToken(userId) → jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}