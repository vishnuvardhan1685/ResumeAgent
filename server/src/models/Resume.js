// src/models/Resume.js
// _id, userId (ObjectId ref 'User'), fileName, cloudinaryUrl,
// parsedText (String), extractedSkills ([String]),
// uploadedAt (default: Date.now)
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    parsedText: { type: String },
    extractedSkills: [{type: String}],
    uploadedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Resume', resumeSchema);