// src/middleware/auth.js
// Export verifyToken middleware. Extract Bearer token from Authorization header → jwt.verify(token, JWT_SECRET)
//  → attach req.user = { id, email } → call next(). On failure, return 401.
import jwt from 'jsonwebtoken';

export const verifyToken = (req,res,next) => {
    const header = req.headers['authorization'];
    const token = header?.startsWith('Bearer ')
        ? header.split(' ')[1]
        : req.query.token;
    if(!token){
        console.log("Authorization header missing");
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}
