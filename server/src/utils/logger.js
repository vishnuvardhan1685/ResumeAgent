// src/utils/logger.js
// Logger middleware to log incoming requests
const logger = (req,res,next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
}

export { logger };