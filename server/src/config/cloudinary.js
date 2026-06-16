// src/config/cloudinary.js
// Call cloudinary.config({ cloud_name, api_key, api_secret }) from env vars. 
// Export the configured cloudinary object and a multer-storage-cloudinary storage 
// instance pointing to the resumes folder with resource_type: 'raw' (for PDFs). 
// Also export the multer upload middleware using that storage (field name: resume, single file).
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'resumes',
        resource_type: 'raw',
    }
})

export const upload = multer({ storage: storage }).single('resume');