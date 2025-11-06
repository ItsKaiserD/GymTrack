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
    status: {
      type: String,
      enum: ["Disponible", "Reservada", "Mantenimiento"],
      default: "Disponible",
    },
}, { timestamps: true });

const Machine = mongoose.model("Machine", machineSchema);

export default Machine;
