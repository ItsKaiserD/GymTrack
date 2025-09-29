import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });

        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
}

export default protectRoute;