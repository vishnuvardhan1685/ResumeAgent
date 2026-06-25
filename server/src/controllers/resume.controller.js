// src/controllers/resume.controller.js
// uploadResume controller logic:

// Multer has already uploaded to Cloudinary → req.file.path is the URL
// Call agentClient.post('/parse-pdf', { cloudinaryUrl: req.file.path }) → get parsedText
// Resume.create({ userId, fileName, cloudinaryUrl, parsedText })
// Return the saved resume doc

// deleteResume: find by _id + userId (ownership check), 
// delete from Cloudinary using cloudinary.uploader.destroy(publicId), then Resume.findByIdAndDelete.
import fs from 'fs';
import Resume from '../models/Resume.js';
import agentClient from '../utils/agentClient.js';
import { cloudinary, useLocalUpload } from '../config/cloudinary.js';

const buildParsePayload = (file) => {
    const storedPath = file.path;
    if (useLocalUpload || !String(storedPath).startsWith('http')) {
        return { filePath: storedPath };
    }
    return { cloudinaryUrl: storedPath };
};

const uploadResume = async (req,res) => {
    const userId = req.user.id;
    if(!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
    }
    const fileName = req.file.originalname;
    const cloudinaryUrl = req.file.path;
    try {
        const response = await agentClient.post('/parse-pdf', buildParsePayload(req.file));        const parsedText = response.data.parsedText;
        const extractedSkills = response.data.extractedData?.skills ?? [];
        const resume = new Resume({ userId, fileName, cloudinaryUrl, parsedText, extractedSkills });
        await resume.save();
        console.log(`Resume uploaded and parsed for user ${userId}: ${fileName}`);
        return res.status(201).json(resume);
    } catch (error) {
        console.error('Resume upload/parse failed:', error.message ?? error);
        const agentDown = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
        const message = agentDown
            ? 'Agent service is unavailable. Start agent_service on port 8000 and retry.'
            : error.response?.data?.detail ?? error.message ?? 'Failed to parse resume PDF';
        return res.status(agentDown ? 503 : 500).json({ message, error: 'Internal server error' });
    }
}

const getResumeById = async (req,res) => {
    const userId = req.user.id;
    const resumeId = req.params.id;
    try {
        const resume = await Resume.findOne({ _id: resumeId, userId });
        if(!resume){
            console.log(`Resume ${resumeId} not found for user ${userId}`);
            return res.status(404).json({ error: 'Resume not found' });
        }
        return res.status(200).json(resume);
    } catch (error) {
        console.error("Error fetching resume:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const getResumes = async (req,res) => {
    const userId = req.user.id;
    try {
        const resumes = await Resume.find({ userId });
        console.log(`Fetched ${resumes.length} resumes for user ${userId}`);
        return res.status(200).json(resumes);
    } catch (error) {
        console.error("Error fetching resumes:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const deleteResume = async (req,res) => {
    const userId = req.user.id;
    const resumeId = req.params.id;
    try {
        const resume = await Resume.findOne({ _id: resumeId, userId });
        if(!resume){
            console.log(`Resume ${resumeId} not found for user ${userId}`);
            return res.status(404).json({ error: 'Resume not found' });
        }
        const publicId = resume.cloudinaryUrl.split('/').pop().split('.')[0];
        if (!useLocalUpload && resume.cloudinaryUrl.startsWith('http')) {
            await cloudinary.uploader.destroy(publicId);
        } else if (useLocalUpload && fs.existsSync(resume.cloudinaryUrl)) {
            fs.unlinkSync(resume.cloudinaryUrl);
        }        await Resume.findByIdAndDelete(resumeId);
        console.log(`Deleted resume ${resumeId} for user ${userId}`);
        return res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error("Error deleting resume:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export { uploadResume, getResumeById, getResumes, deleteResume };
