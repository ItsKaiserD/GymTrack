import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
{
    name: { 
        type: String, 
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
}, { timestamps: true });

const Machine = mongoose.model("Machine", machineSchema);

export default Machine;