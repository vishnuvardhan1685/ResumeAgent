// src/models/MatchResult.js
// _id, userId, resumeId, jobId,
// overallScore (Number), semanticSimilarity (Number), skillMatchPct (Number),
// matchedSkills, missingSkills, bonusSkills ([String]),
// strengthAreas, gapAreas ([String]),
// questions ([Mixed]), suggestions (Mixed),
// createdAt

import mongoose from 'mongoose';

const MatchResultSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    overallScore: { type: Number },
    semanticSimilarity: { type: Number },
    skillMatchPct: { type: Number },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    bonusSkills: [{ type: String }],
    strengthAreas: [{ type: String }],
    gapAreas: [{ type: String }],
    questions: [{ type: mongoose.Schema.Types.Mixed }],
    suggestions: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('MatchResult', MatchResultSchema);