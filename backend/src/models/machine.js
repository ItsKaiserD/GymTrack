import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    image: {
        type: String
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }
}, { timestamps: true });

const Machine = mongoose.model('Machine', machineSchema);

export default Machine;