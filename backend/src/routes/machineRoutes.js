// backend/src/routes/machineRoutes.js
import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Machine from "../models/Machine.js";

/**
 * @openapi
 * /api/machines:
 *   get:
 *     summary: Lista máquinas (paginadas)
 *     tags: [Machines]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MachineListResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/machines:
 *   post:
 *     summary: Crea una máquina (con imagen subida)
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, image]
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [Disponible, Reservada, Mantenimiento]
 *                 description: Si no se envía, usa default "Disponible".
 *     responses:
 *       201:
 *         description: Creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MachineCreateResponse' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: No autorizado
 */

/**
 * @openapi
 * /api/machines/{id}/status:
 *   patch:
 *     summary: Actualiza el estado de una máquina
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Disponible, Reservada, Mantenimiento]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Machine' }
 *       400:
 *         description: Estado inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No encontrada
 */
/**
 * @openapi
 * /api/machines/{id}/reserve:
 *   post:
 *     summary: Reservar una máquina por minutos (bloques de 15)
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [minutes]
 *             properties:
 *               minutes:
 *                 type: integer
 *                 description: "Múltiplos de 15 entre 15 y 180."
 *                 example: 30
 *     responses:
 *       200:
 *         description: Reservada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Machine' }
 *       400: { description: Duración inválida }
 *       401: { description: No autorizado }
 *       409: { description: Ocupada o no expirada }
 */
/**
 * @openapi
 * /api/machines/my-reservations:
 *   get:
 *     summary: Lista las máquinas reservadas por el usuario actual
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Machine'
 *       401:
 *         description: No autorizado
 */

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

// PATCH /api/machines/:id/status  (trainer/admin)
router.patch("/:id/status", protectRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const raw = String(req.body.status || "").trim();
    const ALLOWED = new Set(["Disponible", "Reservada", "Mantenimiento"]);

    if (!ALLOWED.has(raw)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const updated = await Machine.findByIdAndUpdate(
      id,
      { $set: { status: raw } },
      { new: true }
    )
      .populate("user", "username email role")
      .lean();

    if (!updated) return res.status(404).json({ message: "Máquina no encontrada" });
    return res.json(updated);
  } catch (e) {
    console.error("[machines PATCH /:id/status] error:", e.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/machines/:id/reserve
router.post("/:id/reserve", protectRoute, async (req, res) => {
  try {
    const { id } = req.params;

    // minutos solicitados
    const minutes = Number(req.body?.minutes);
    const isValid =
      Number.isInteger(minutes) &&
      minutes % 15 === 0 &&
      minutes >= 15 &&
      minutes <= 180;

    if (!isValid) {
      return res.status(400).json({
        message: "Duración inválida. Usa múltiplos de 15 entre 15 y 180.",
      });
    }

    const now = new Date();
    const expires = new Date(now.getTime() + minutes * 60 * 1000);

    // solo si está Disponible o Reservada pero ya expirada
    const filter = {
      _id: id,
      $or: [
        { status: "Disponible" },
        { status: "Reservada", reservationExpiresAt: { $lte: now } },
      ],
    };

    const update = {
      $set: {
        status: "Reservada",
        reservedBy: req.user._id,
        reservationStartedAt: now,
        reservationExpiresAt: expires,
      },
    };

    const doc = await Machine.findOneAndUpdate(filter, update, { new: true })
      .populate("user", "username email role")
      .populate("reservedBy", "username email role")
      .lean();

    if (!doc) {
      return res
        .status(409)
        .json({ message: "No se puede reservar (ocupada o no expirada)." });
    }

    return res.json(doc);
  } catch (e) {
    console.error("[reserve] error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/machines/my-reservations
router.get("/my-reservations", protectRoute, async (req, res) => {
  try {
    const now = new Date();
    const docs = await Machine.find({
      reservedBy: req.user._id,                  // reservadas por el usuario actual
      status: "Reservada",                       // estado actual reservado
    })
      .select("_id name image status reservationExpiresAt reservationStartedAt")
      .sort({ reservationExpiresAt: 1 })
      .lean();

    return res.json(docs);
  } catch (e) {
    console.error("[machines GET /my-reservations] error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
