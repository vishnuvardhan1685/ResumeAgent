// server.js
// jsconst app = require('./app');
// const { connectDB } = require('./src/config/db');

// connectDB().then(() => {
//   app.listen(process.env.PORT || 5000, () => {
//     console.log(`Server running on port 5000`);
//   });
// });
import express from 'express';
import { connectDB } from './src/config/db';
import app from './app.js';

connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
})