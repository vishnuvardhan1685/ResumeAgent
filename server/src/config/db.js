// src/config/db.js
// Connects to MongoDB using MONGODB_URI from env. 
// Export a connectDB() async function called once in server.js.
// Use mongoose.connect() with { useNewUrlParser: true, useUnifiedTopology: true }.
// Log success or throw on failure.
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
}
