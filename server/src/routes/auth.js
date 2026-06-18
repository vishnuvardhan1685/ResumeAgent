// src/routes/auth.js + src/controllers/auth.controller.js
// Routes:

// POST /api/auth/google → googleAuth
// POST /api/auth/refresh → refreshToken

// googleAuth controller logic:

// Receive { token } (Google ID token from frontend)
// Verify via google-auth-library's OAuth2Client.verifyIdToken()
// Extract { name, email, sub (googleId) } from payload
// User.findOneAndUpdate({ googleId }, { name, email }, { upsert: true, new: true })
// Return { accessToken, refreshToken, user }

// refreshToken controller logic:

// Receive { refreshToken } in body
// jwt.verify(refreshToken, JWT_REFRESH_SECRET) → get userId
// Return new { accessToken }
import express from 'express';
import { googleAuth, refreshToken, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/refresh', refreshToken);
router.delete('/logout', logout);

export default router;
