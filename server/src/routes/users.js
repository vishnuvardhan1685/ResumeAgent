// src/routes/users.js + src/controllers/user.controller.js
// All routes behind verifyToken.
// Routes:

// GET /api/user/profile → getProfile — User.findById(req.user.id)
// PUT /api/user/profile → updateProfile — allow updating targetRole, experienceLevel, 
// preferredLocation only (whitelist fields, never let user update email or googleId)
import express from 'express';
import { verifyToken } from '../middlewares/auth';
import { getProfile, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
