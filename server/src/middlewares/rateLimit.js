// src/middleware/rateLimit.js
// Use express-rate-limit with a custom Redis store (rate-limit-redis). 
// Set windowMs: 15 * 60 * 1000 (15 min), max: 100 for general routes. 
// Export a stricter discoverRateLimit with max: 10 for the discover endpoint (it calls SerpAPI).
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

const generalRateLimit = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    onLimitReached: (req, res, options) => {
        console.log(`Rate limit exceeded for IP: ${req.ip}`);
    }
});

const discoverRateLimit = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    onLimitReached: (req, res, options) => {
        console.log(`Discover rate limit exceeded for IP: ${req.ip}`);
    }
});

export { generalRateLimit, discoverRateLimit };