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
    // NUEVO: metadatos de reserva
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reservationStartedAt: { type: Date, default: null },
    reservationExpiresAt: { type: Date, default: null },
    // NUEVO: info del último reporte de mantenimiento
    lastReportMessage: { type: String, default: null },
    lastReportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastReportedAt: { type: Date, default: null },
}, { timestamps: true });

const Machine = mongoose.model("Machine", machineSchema);

export default Machine;
