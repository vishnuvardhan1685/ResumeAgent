// src/middleware/rateLimit.js
// Use express-rate-limit with a custom Redis store (rate-limit-redis). 
// Set windowMs: 15 * 60 * 1000 (15 min), max: 100 for general routes. 
// Export a stricter discoverRateLimit with max: 10 for the discover endpoint (it calls SerpAPI).
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

const shouldUseRedisStore = process.env.NODE_ENV === 'production' && Boolean(process.env.REDIS_URL);

const redisStore = () => shouldUseRedisStore ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
}) : undefined;

const generalRateLimit = rateLimit({
    store: redisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req, res) => {
        console.log(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).send('Too many requests from this IP, please try again after 15 minutes');
    }
});

const discoverRateLimit = rateLimit({
    store: redisStore(),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req, res) => {
        console.log(`Discover rate limit exceeded for IP: ${req.ip}`);
        res.status(429).send('Too many requests from this IP, please try again after 15 minutes');
    }
});

export { generalRateLimit, discoverRateLimit };
