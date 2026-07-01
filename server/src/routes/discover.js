// src/routes/discover.js + src/controllers/discover.controller.js
// Behind verifyToken + discoverRateLimit.
// Route: POST /api/jobs/discover
import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { discoverRateLimit } from '../middlewares/rateLimit.js';
import { discoverJobs } from '../controllers/discover.controller.js';

const router = express.Router();

router.use(verifyToken);
router.use(discoverRateLimit);

router.post('/', discoverJobs);

export default router;