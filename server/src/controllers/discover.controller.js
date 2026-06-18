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
import agentClient from '../utils/agentClient.js';
import JobListing from '../models/JobListing.js';

const discoverJobs = async (req,res) => {
    const { resumeId } = req.body;
    try {
        let cached = null;
        try {
            cached = await redisClient.get(`discover:${resumeId}`);
        } catch (cacheError) {
            console.log(`Redis cache read skipped for discover:${resumeId}: ${cacheError.message}`);
        }
        if(cached) {
            console.log(`Cache hit for discover:${resumeId}`);
            return res.status(200).json(JSON.parse(cached));
        }
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
        if(!resume) {
            console.log(`Resume ${resumeId} not found for user ${req.user.id}`);
            return res.status(404).json({ message: "Resume not found" });
        }
        const response = await agentClient.post('/discover', { resumeId, parsedText: resume.parsedText });
        const listings = Array.isArray(response.data) ? response.data : response.data.jobs;
        const listingsWithOwner = listings.map((listing) => ({
            ...listing,
            userId: req.user.id,
            resumeId,
        }));
        await JobListing.insertMany(listingsWithOwner);
        try {
            await redisClient.setex(`discover:${resumeId}`, 21600, JSON.stringify({ jobs: listingsWithOwner }));
        } catch (cacheError) {
            console.log(`Redis cache write skipped for discover:${resumeId}: ${cacheError.message}`);
        }
        console.log(`Discover results cached for discover:${resumeId}`);
        return res.status(200).json({ jobs: listingsWithOwner });
    } catch (error) {
        console.error(`Error in discoverJobs for resume ${resumeId} and user ${req.user.id}:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { discoverJobs };
