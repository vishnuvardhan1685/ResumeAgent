// src/routes/jobs.js + src/controllers/job.controller.js
// All routes behind verifyToken.
// Routes:

// POST /api/jobs → createJob
// GET /api/jobs → listJobs
// GET /api/jobs/:id → getJob
// DELETE /api/jobs/:id → deleteJob
import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { createJob, listJobs, getJob, deleteJob } from '../controllers/job.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createJob);
router.get('/', listJobs);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);

export default router;