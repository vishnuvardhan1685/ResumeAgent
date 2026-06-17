// src/routes/discover.js + src/controllers/discover.controller.js
// Controller logic:
// Receive { resumeId } from body
// Check Redis: const cached = await redis.get(discover:${resumeId}) → if hit, return JSON.parse(cached)
// Fetch resume doc → verify ownership (resume.userId.toString() === req.user.id)
// Call agentClient.post('/discover', { resumeId, parsedText: resume.parsedText })
// Get back array of ranked job listings
// Bulk-insert into JobListing collection: JobListing.insertMany(listings)
// Cache result: redis.setex(discover:${resumeId}, 21600, JSON.stringify(listings))
// Return listings
import express from 'express';
import redisClient from '../config/redis.js';
import Resume from '../models/Resume.js';
import { agentClient } from '../utils/agentClient.js';
import JobListing from '../models/JobListing.js';

const discoverJobs = async (req,res) => {
    const { resumeId } = req.body;
    try {
        const cached = await redisClient.get(`discover:${resumeId}`);
        if(cached) {
            console.log(`Cache hit for discover:${resumeId}`);
            return res.status(200).json(JSON.parse(cached));
        }
        const resume = await resume.findOne({ _id: resumeId, userId: req.user.id });
        if(!resume) {
            console.log(`Resume ${resumeId} not found for user ${req.user.id}`);
            return res.status(404).json({ message: "Resume not found" });
        }
        const response = await agentClient.post('/discover', { resumeId, parsedText: resume.parsedText });
        const listings = response.data;
        await JobListing.insertMany(listings);
        await redisClient.setEx(`discover:${resumeId}`, 21600, JSON.stringify(listings));
        console.log(`Discover results cached for discover:${resumeId}`);
        return res.status(200).json(listings);
    } catch (error) {
        console.error(`Error in discoverJobs for resume ${resumeId} and user ${req.user.id}:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { discoverJobs };