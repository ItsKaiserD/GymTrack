// backend/src/routes/machineRoutes.js
import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Machine from "../models/Machine.js";
import Reservation from "../models/Reservation.js";

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
 *     summary: Crear una reserva futura para una máquina
 *     description: |
 *       Crea una reserva en una fecha y hora específicas para la máquina indicada.
 *       La duración debe ser un múltiplo de 15 minutos entre 15 y 180.
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la máquina a reservar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *               - minutes
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2025-11-20"
 *                 description: Fecha de la reserva en formato YYYY-MM-DD.
 *               time:
 *                 type: string
 *                 example: "10:30"
 *                 description: Hora de inicio en formato HH:mm (24 horas).
 *               minutes:
 *                 type: integer
 *                 example: 30
 *                 description: Duración en minutos (múltiplos de 15, entre 15 y 180).
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Datos inválidos (fecha/hora/duración)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Máquina no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ya existe una reserva en ese horario o máquina en mantención
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error de servidor
 */
/**
 * @openapi
 * /api/machines/my-reservations:
 *   get:
 *     summary: Listar reservas futuras/actuales del usuario actual
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationListResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error de servidor
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

// Reserva futura de una máquina en fecha/hora concreta
// Body esperado:
// {
//   "date": "2025-11-20",        // YYYY-MM-DD
//   "time": "10:30",             // HH:mm (24h)
//   "minutes": 30                // 15, 30, 45, ... (múltiplos de 15)
// }
router.post("/:id/reserve", protectRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, minutes } = req.body;

    // --- 1) Validar duración ---
    const mins = Number(minutes);
    const isValidDuration =
      Number.isInteger(mins) &&
      mins % 15 === 0 &&
      mins >= 15 &&
      mins <= 180; // por ejemplo, máx 3h

    if (!isValidDuration) {
      return res.status(400).json({
        message: "Duración inválida. Usa múltiplos de 15 entre 15 y 180.",
      });
    }

    // --- 2) Validar fecha y hora ---
    if (!date || !time) {
      return res
        .status(400)
        .json({ message: "Debe enviar 'date' (YYYY-MM-DD) y 'time' (HH:mm)." });
    }

    // OJO: aquí asumimos que date+time están en UTC o en la tz del servidor.
    // Si quieres manejar zona horaria de Chile, después se puede afinar.
    const startAt = new Date(`${date}T${time}:00.000Z`);
    if (Number.isNaN(startAt.getTime())) {
      return res.status(400).json({ message: "Fecha u hora inválidas." });
    }
    const endAt = new Date(startAt.getTime() + mins * 60 * 1000);

    const now = new Date();
    if (startAt <= now) {
      return res
        .status(400)
        .json({ message: "La reserva debe ser en el futuro." });
    }

    // --- 3) Verificar que la máquina existe ---
    const machine = await Machine.findById(id).lean();
    if (!machine) {
      return res.status(404).json({ message: "Máquina no encontrada." });
    }

    // Opcional: no permitir reservas si la máquina está en mantenimiento
    if (machine.status === "Mantenimiento") {
      return res.status(409).json({
        message: "La máquina está en mantención. No se puede reservar.",
      });
    }

    // --- 4) Verificar solapamientos de reservas para esa máquina ---
    // Buscamos reservas que se crucen con [startAt, endAt)
    const overlap = await Reservation.findOne({
      machine: id,
      status: { $in: ["Reservada", "Activa"] },
      $or: [
        {
          startAt: { $lt: endAt },
          endAt: { $gt: startAt },
        },
      ],
    }).lean();

    if (overlap) {
      return res.status(409).json({
        message: "Ya existe una reserva en ese horario para esta máquina.",
      });
    }

    // --- 5) Crear la reserva ---
    const reservation = await Reservation.create({
      machine: id,
      user: req.user._id,
      startAt,
      endAt,
      status: "Reservada",
    });

    // Podemos devolver la reserva con info de la máquina
    const populated = await reservation.populate([
      { path: "machine", select: "name image" },
      { path: "user", select: "username email role" },
    ]);

    return res.status(201).json(populated);
  } catch (e) {
    console.error("[machines POST /:id/reserve] error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// Reservas futuras del usuario actual
router.get("/my-reservations", protectRoute, async (req, res) => {
  try {
    const now = new Date();
    const reservations = await Reservation.find({
      user: req.user._id,
      status: { $in: ["Reservada", "Activa"] },
      endAt: { $gte: now }, // solo actuales/futuras
    })
      .populate("machine", "name image")
      .sort({ startAt: 1 })
      .lean();

    return res.json(reservations);
  } catch (e) {
    console.error("[machines GET /my-reservations] error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});


export default router;
