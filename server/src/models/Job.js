// src/models/Job.js
// _id, userId (ObjectId ref 'User'), title, company,
// seniorityLevel, jdText, extractedSkills ([String]),
// pgvectorId (Number — row id from pgvector), createdAt
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    seniorityLevel: { type: String },
    jdText: { type: String },
    extractedSkills: [{ type: String }],
    pgvectorId: { type: Number },
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Job', jobSchema);