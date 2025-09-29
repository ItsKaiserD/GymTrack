import express from 'express';
import cloudinary from "../lib/cloudinary.js";
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, async (req, res) => {
    try {
        const { name, image, status, createdBy } = req.body;
        if (!name || !createdBy || !image) 
            return res.status(400).json({ message: 'Items Are Required To Register New Machine' });
        
        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // Save machine to database
        const newMachine = new GymMachine({ 
            name, 
            image: imageUrl, 
            status, 
            createdBy: req.user._id
         });

        await newMachine.save();

        res.status(201).json(newMachine);

    } catch (error) {
        console.error('Error creating machine:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.get('/', protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const machines = await GymMachine.find().sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username');

        const totalMachines = await GymMachine.countDocuments();

        res.send({
            machines,
            currentPage: page,
            totalMachines,
            totalPages: Math.ceil(totalMachines / limit)
        });

    } catch (error) {
        console.error('Error fetching machines:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;