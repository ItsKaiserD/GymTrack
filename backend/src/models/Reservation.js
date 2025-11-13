// backend/src/models/Reservation.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Fecha y hora de inicio de la reserva
    startAt: {
      type: Date,
      required: true,
    },
    // Fecha y hora de término (startAt + duración)
    endAt: {
      type: Date,
      required: true,
    },
    // Para futuro: distinguir programada, activa, completada, cancelada
    status: {
      type: String,
      enum: ["Reservada", "Activa", "Completada", "Cancelada"],
      default: "Reservada",
    },
  },
  { timestamps: true }
);

// Buscar rápido solapamientos por máquina y rango
reservationSchema.index({ machine: 1, startAt: 1, endAt: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
