// createJob controller logic:

// Validate body has jdText (required), title, company, seniorityLevel
// Job.create({ userId, ...fields })
// Fire-and-forget: call agentClient.post('/embed-jd', { jobId: job._id, jdText }) to trigger embedding in FastAPI (don't await — let it happen async, FastAPI will update pgvectorId via a callback or just store it independently)
// Return saved job

import express from 'express';
import Job from '../models/Job.js';
import agentClient from '../utils/agentClient.js';

const createJob = async (req,res) => {
    const userId = req.user.id;
    const { title, company, seniorityLevel, jdText } = req.body;
    if(!jdText) {
        return res.status(400).json({ message: "Job description text (jdText) is required" });
    }
    try {
        const job = new Job({ userId, title, company, seniorityLevel, jdText });
        await job.save();
        console.log(`Job created with ID ${job._id} for user ${userId}`);
        // Fire-and-forget embedding
        agentClient.post('/embed-jd', { jobId: job._id, jdText })
            .then(() => console.log(`Embedding triggered for job ${job._id}`))
            .catch(err => console.error(`Error triggering embedding for job ${job._id}:`, err));
        return res.status(201).json(job);
    } catch (error) {
        console.error(`Error creating job for user ${userId}:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const listJobs = async (req,res) => {
    const userId = req.user.id;
    try {
        const jobs = await Job.find({ userId }).select('-jdText -__v');
        console.log(`Fetched ${jobs.length} jobs for user ${userId}`);
        return res.status(200).json(jobs);
    } catch (error) {
        console.error(`Error fetching jobs for user ${userId}:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getJob = async (req,res) => {
    const userId = req.user.id;
    const jobId = req.params.id;
    try {
        const job = await Job.findOne({ _id: jobId, userId }).select('-jdText -__v');
        if(!job) {
            console.log(`Job ${jobId} not found for user ${userId}`);
            return res.status(404).json({ message: "Job not found" });
        }
        return res.status(200).json(job);
    } catch (error) {
        console.error(`Error fetching job ${jobId} for user ${userId}:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const deleteJob = async (req,res) => {
    const userId = req.user.id;
    const jobId = req.params.id;
    try {
        const job = await Job.findOneAndDelete({ _id: jobId, userId });
        if(!job){
            console.log(`Job ${jobId} not found for user ${userId}`);
            return res.status(404).json({ message: "Job not found" });
        }
        return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error(`Error deleting job ${jobId} for user ${userId}:`, error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { createJob, listJobs, getJob, deleteJob };
