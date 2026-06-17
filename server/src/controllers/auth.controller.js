// src/routes/auth.js + src/controllers/auth.controller.js

// googleAuth controller logic:

// Receive { token } (Google ID token from frontend)
// Verify via google-auth-library's OAuth2Client.verifyIdToken()
// Extract { name, email, sub (googleId) } from payload
// User.findOneAndUpdate({ googleId }, { name, email }, { upsert: true, new: true })
// Return { accessToken, refreshToken, user }

// refreshToken controller logic:

// Receive { refreshToken } in body
// jwt.verify(refreshToken, JWT_REFRESH_SECRET) → get userId
// Return new { accessToken }
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';

const googleAuth = async (req, res) => {
    const { token } = req.body;
    if(!token) {
        return res.status(400).json({ message: "Token is required" });
    }
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        const { name, email, sub: googleId } = ticket.getPayload();
        const user = await User.findOneAndUpdate(
            { googleId },
            { name, email },
            { upsert: true, new: true }
        );
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        return res.status(200).json({ accessToken, refreshToken, user });   
    } catch (error) {
        console.log("Google authentication failed:", error);
        return res.status(401).json({ message: "Google authentication failed" });
    }
}

const refreshToken = async (req,res) => {
    const { refreshToken } = req.body;
    if(!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const userId = decoded.id;
        const newAccessToken = generateAccessToken(userId);
        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.log("Refresh token failed:", error);
        return res.status(401).json({ message: "Refresh token failed" });
    }
}

export { googleAuth, refreshToken };