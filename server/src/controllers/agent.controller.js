// src/controllers/agent.controller.js
// Logic:

// Set headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
// Validate { resumeId, jobId } exist and belong to req.user.id
// Use axios({ method: 'post', url: AGENT_SERVICE_URL + '/analyze', data: { resumeId, jobId }, responseType: 'stream' }) to get a stream
// Pipe the FastAPI stream chunks directly to res via stream.on('data', chunk => res.write(chunk))
// On stream end: res.end()
// On client disconnect: abort the axios request

import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import agentClient from '../utils/agentClient.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';

const analyze = async (req,res) => {
    const { resumeId, jobId } = req.body;
    try {
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
        if(!resume){
            console.log('Resume not found or does not belong to user:', resumeId);
            return res.status(404).json({ message: "Resume not found" });
        }
        const job = await Job.findOne({ _id: jobId, userId: req.user.id });
        if(!job){
            console.log('Job listing not found or does not belong to user:', jobId);
            return res.status(404).json({ message: "Job listing not found" });
        }
        const response = await agentClient({
            method: 'post',
            url: '/analyze',
            data: { resumeId, jobId },
            responseType: 'stream',
            timeout: 0
        });
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        response.data.on('data', chunk => {
            res.write(chunk);
        });
        response.data.on('end', () => {
            res.end();
        });
        response.data.on('error', (streamError) => {
            console.error('Agent stream failed:', streamError);
            if (!res.writableEnded) {
                res.write(`event: error\ndata: ${JSON.stringify({ message: 'Agent pipeline stream failed' })}\n\n`);
                res.end();
            }
        });
        req.on('close', () => {
            response.data.destroy();
        });
    } catch (error) {
        console.log(`Error in analyze route for resume ${resumeId} and job ${jobId}:`, error);
        const status = error.response?.status ?? 500;
        const message = error.response?.data?.detail ?? error.response?.data?.message ?? "Agent pipeline failed";
        return res.status(status).json({ message });
    }
}

export { analyze };
