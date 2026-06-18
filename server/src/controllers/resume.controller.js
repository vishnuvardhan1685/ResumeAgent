// src/controllers/resume.controller.js
// uploadResume controller logic:

// Multer has already uploaded to Cloudinary → req.file.path is the URL
// Call agentClient.post('/parse-pdf', { cloudinaryUrl: req.file.path }) → get parsedText
// Resume.create({ userId, fileName, cloudinaryUrl, parsedText })
// Return the saved resume doc

// deleteResume: find by _id + userId (ownership check), 
// delete from Cloudinary using cloudinary.uploader.destroy(publicId), then Resume.findByIdAndDelete.
import express from 'express';
import Resume from '../models/Resume.js';
import agentClient from '../utils/agentClient.js';
import { cloudinary } from '../config/cloudinary.js';

const uploadResume = async (req,res) => {
    const userId = req.user.id;
    if(!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
    }
    const fileName = req.file.originalname;
    const cloudinaryUrl = req.file.path;
    try {
        const response = await agentClient.post('/parse-pdf', { cloudinaryUrl });
        const parsedText = response.data.parsedText;
        const resume = new Resume({ userId, fileName, cloudinaryUrl, parsedText });
        await resume.save();
        console.log(`Resume uploaded and parsed for user ${userId}: ${fileName}`);
        return res.status(201).json(resume);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
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
        await cloudinary.uploader.destroy(publicId);
        await Resume.findByIdAndDelete(resumeId);
        console.log(`Deleted resume ${resumeId} for user ${userId}`);
        return res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error("Error deleting resume:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export { uploadResume, getResumeById, getResumes, deleteResume };
