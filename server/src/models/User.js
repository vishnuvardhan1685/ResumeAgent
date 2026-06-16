// src/models/User.js
//  _id (auto), name, email (unique), googleId (unique, sparse),
// targetRole (String), experienceLevel (String),
// preferredLocation (String), createdAt (default: Date.now)
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type:  String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    targetRole: { type: String },
    experienceLevel: { type: String },
    preferredLocation: { type: String },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', userSchema);