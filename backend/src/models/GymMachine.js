import mongoose from "mongoose";

const gymMachineSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    }, 
    image: { 
        type: String,
        required: true
    },

    status: { 
        type: String, 
        enum: ['available', 'in_use', 'out_of_order'], 
        default: 'available' 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }
}, { timestamps: true });

const GymMachine = mongoose.model('GymMachine', gymMachineSchema);

export default GymMachine;