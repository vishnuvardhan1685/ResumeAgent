// src/utils/asyncHandler.js
// js// Wraps async route handlers to forward errors to errorHandler
// const asyncHandler = (fn) => (req, res, next) => 
//   Promise.resolve(fn(req, res, next)).catch(next);
// module.exports = asyncHandler;
// Use this everywhere in controllers instead of try/catch.

const asyncHandler = (fn) => (req,res,next) => {
    Promise.resolve(fn(req,res,next)).catch(next);
}

export default asyncHandler;