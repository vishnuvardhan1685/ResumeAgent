// src/middleware/errorHandler.js
// A 4-argument Express error handler (err, req, res, next). Log the error, 
// return res.status(err.statusCode || 500).json({ success: false, message: err.message }).

import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
    console.log(`Error: ${err.message}, Status Code: ${err.statusCode || 500}`);
}