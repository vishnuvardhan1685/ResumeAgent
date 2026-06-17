// src/routes/resumes.js + src/controllers/resume.controller.js
// All routes behind verifyToken.
// Routes:

// POST /api/resumes/upload — multer middleware first, then controller
// GET /api/resumes
// GET /api/resumes/:id
// DELETE /api/resumes/:id
import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { uploadResume, getResumes, getResumeById, deleteResume } from '../controllers/resume.controller.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(verifyToken);

router.post('/upload', upload , uploadResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;