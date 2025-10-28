import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("[db] MONGO_URI no definido");
    process.exit(1);
  }

  // Opcional: ver errores rápido en vez de buffer
  // mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // sube a 15s
    });
    console.log("[db] Conectado a MongoDB:", mongoose.connection.host);
  } catch (err) {
    console.error("[db] Error conectando a MongoDB:", err.message);
    throw err; // deja que el caller decida
  }

  mongoose.connection.on("error", (e) => {
    console.error("[db] Mongo error:", e.message);
  });
}
