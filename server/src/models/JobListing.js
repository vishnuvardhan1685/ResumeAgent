// src/models/JobListing.js
// _id, userId, resumeId,
// title, company, location, description, applyLink,
// source (enum: ['google_jobs', 'internshala']),
// matchScore (Number), fetchedAt (default: Date.now)
// TTL index on fetchedAt with 21600s (6 hours) so stale listings auto-delete from Mongo too.
import mongoose from 'mongoose';

const JobListingSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    applyLink: { type: String },
    source: { type: String, enum: ['google_jobs', 'internshala'] },
    matchScore: { type: Number },
    fetchedAt: { type: Date, default: Date.now, index: { expires: '6h' }},
})

export default mongoose.model('JobListing', JobListingSchema);