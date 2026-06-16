// src/config/redis.js
// Create an ioredis client using REDIS_URL. Export the client. Handle error events so a Redis failure doesn't crash the app.
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

export default redisClient;