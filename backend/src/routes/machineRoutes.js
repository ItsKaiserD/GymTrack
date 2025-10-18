// backend/src/routes/machineRoutes.js
import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Machine from "../models/Machine.js";

console.log("[machineRoutes] VERSION=v8");
const router = express.Router();

// Multer en memoria (25 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// LISTAR
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page ?? "1", 10);
    const limit = parseInt(req.query.limit ?? "10", 10);
    const skip = (page - 1) * limit;

    const machines = await Machine.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

    const totalMachines = await Machine.countDocuments();

    res.json({
      machines,
      currentPage: page,
      totalMachines,
      totalPages: Math.ceil(totalMachines / limit),
    });
  } catch (error) {
    console.error("Error fetching machines:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ⚠️ CREAR: primero multer, luego auth, luego handler — y SIN destructuring inseguro
router.post("/", upload.single("image"), protectRoute, async (req, res) => {
  console.log("[machineRoutes] POST /api/machines handler v7");
  try {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    console.log("POST /api/machines Content-Type:", ct, "hasFile?", !!req.file, "hasBody?", !!req.body);

    if (!ct.includes("multipart/form-data")) {
      return res.status(400).json({
        message: "Se esperaba multipart/form-data. No fijes 'Content-Type' manualmente en el cliente.",
      });
    }

    const body = req.body || {};
    const name = (body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Campo 'name' es requerido" });
    if (!req.file) return res.status(400).json({ message: "Campo 'image' (archivo) es requerido" });

    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autorizado" });

    // Subir a Cloudinary via stream (desde buffer de multer)
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "machines" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
      });

    const uploadResult = await streamUpload(req.file.buffer);
    const newMachine = new Machine({ name, image: uploadResult.secure_url, user: userId });
    await newMachine.save();

    return res.status(201).json(newMachine);
  } catch (error) {
    console.error("Error creating machine:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// DEL usuario (ya la tienes)
router.get("/user", protectRoute, async (req, res) => {
  try {
    const machines = await Machine.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(machines);
  } catch (error) {
    console.error("Error al obtener máquinas del usuario:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE (sin cambios)
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Máquina no encontrada" });

    const userId = req.user?._id?.toString?.() || req.user?.id?.toString?.();
    if (!userId || machine.user.toString() !== userId) {
      return res.status(401).json({ message: "Acción no autorizada" });
    }

    await machine.deleteOne();
    res.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.log("Error eliminando máquina", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/_probe", (req, res) => {
  res.json({
    version: "v7",
    route_file: import.meta.url,
    content_type: req.headers["content-type"] || null,
    has_body: !!req.body,
    has_file: !!(req.file),
    keys: req.body ? Object.keys(req.body) : [],
  });
});


export default router;
