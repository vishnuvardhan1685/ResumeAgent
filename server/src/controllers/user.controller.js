// src/routes/users.js + src/controllers/user.controller.js
// All routes behind verifyToken.
// Routes:

// GET /api/user/profile → getProfile — User.findById(req.user.id)
// PUT /api/user/profile → updateProfile — allow updating targetRole, experienceLevel, 
// preferredLocation only (whitelist fields, never let user update email or googleId)
import express from 'express';
import User from '../models/User.js';

const getProfile = async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-googleId -__v');
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(`Fetched profile for user ${req.user.id}:`, user);
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const updateProfile = async (req,res) => {
    const { targetRole, experienceLevel, preferredLocation } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        user.targetRole = targetRole || user.targetRole;
        user.experienceLevel = experienceLevel || user.experienceLevel;
        user.preferredLocation = preferredLocation || user.preferredLocation;
        await user.save();
        console.log(`Updated profile for user ${req.user.id}:`, user);
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export { getProfile, updateProfile };