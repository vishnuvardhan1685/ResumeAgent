// src/config/redis.js
// Create an ioredis client using REDIS_URL. Export the client. Handle error events so a Redis failure doesn't crash the app.
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL?.replace(/^"|"$/g, '');

const redisClient = new Redis(redisUrl, {
    lazyConnect: process.env.NODE_ENV !== 'production',
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy: null,
});

redisClient.on('error', (err) => {
    console.log('Redis error:', err.message);
});

export default redisClient;
