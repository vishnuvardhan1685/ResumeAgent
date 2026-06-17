// src/routes/agent.js
// Behind verifyToken.
// Route: POST /api/agent/analyze

// This is an SSE proxy — it streams FastAPI's SSE response back to the browser.

import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { analyze } from '../controllers/agent.controller.js';

const router = express.Router();
router.post('/analyze', verifyToken, analyze);

export default router;