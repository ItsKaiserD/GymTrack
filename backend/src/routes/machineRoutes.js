import express from 'express';
import cloudinary from "../lib/cloudinary.js";
import protectRoute from '../middleware/auth.middleware.js';
import Machine from '../models/machine.js';

const router = express.Router();

router.post('/machines', protectRoute, async (req, res) => {
    try {
        const { name, image } = req.body;
        if (!name) 
            return res.status(400).json({ message: 'Por favor rellene todos los campos' });
        
        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // Save machine to database
        const newMachine = new Machine({ 
            name,
            image: imageUrl,
            createdBy: req.user._id
         });

        await newMachine.save();

        res.status(201).json(newMachine);

    } catch (error) {
        console.error('Error creating machine:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/', protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const machines = await Machine.find().sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username');

        const totalMachines = await Machine.countDocuments();

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

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).json({message: "Máquina no encontrada"});


        if (machine.user.toString() != req.user._id.toString())
            return res.status(401).json({message: "Acción no autorizada"});

        // if (machine.image && machine.image.includes("cloudinary")){
           // try {
             //   const publicId = machine.image.split("/").pop().split(".")[0];
               // await cloudinary.uploader.destroy(publicId);
            //} catch (deleteError) {
              //  console.log("Error eliminando imagen de Cloudinary", deleteError);
            //}
        //}

        await machine.deleteOne();

        res.json({message: "Imagen eliminada correctamente"});

    } catch (error) {
        console.log("Error eliminando máquina", error);
        res.status(500).json({message:"Internal Server Error"})
    }
});

router.get('/user', protectRoute, async (req, res) => {
    try {
        const machines = await Machine.find({user: req.user._id}).sort({createdAt: -1});
        res.json(machines); 
    } catch (error) {
        console.error("Error al obtener máquinas del usuario:", error.message);
        res.status(500).json({message: "Server Error"})
    }
})

export default router;