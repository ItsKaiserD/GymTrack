import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { notifyAdminsByEmail } from "../lib/mailer.js";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       401:
 *         description: Credenciales inválidas
 */
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Crear una nueva cuenta de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: entrenador01
 *               email:
 *                 type: string
 *                 example: entrenador01@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [admin, trainer]
 *                 example: trainer
 *                 description: Cuentas creadas desde el sistema quedan como "trainer", no se puede
 *                  registrar "admin" desde register público.
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *       400:
 *         description: Datos inválidos o usuario ya existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = express.Router();

const ADMIN_WHITELIST = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const generateToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'});
}

//router.post('/register', async(req, res) => {
  // Handle login logic here
  //try {
    //const {email, username, password, role} = req.body;

    //if (!email || !username || !password) {
      //return res.status(400).json({message: "All fields are required"});
    //}

    //if (password.length < 6) {
      //return res.status(400).json({message: "Password must be at least 6 characters"});
    //}

    //if (username.length < 3) {
      //return res.status(400).json({message: "Username must be at least 3 characters"});
    //}

    //const allowedRoles = ["admin", "trainer"];
    //const normalizedRole = allowedRoles.includes(role) ? role : "trainer";

    // Check if user already exists
    //const existingEmail = await User.findOne({email});
    //if (existingEmail) {
      //return res.status(400).json({message: "Email already in use"});
    //}

    //const existingUsername = await User.findOne({username});
    //if (existingUsername) {
      //return res.status(400).json({message: "Username already in use"});
    //}

    // Create new user
    //const newUser = new User({
      //email, 
      //username, 
      //password,
      //role: normalizedRole
    //});

    //await newUser.save();

    // Generate JWT
    //const token = generateToken(newUser._id);

    //res.status(201).json({
      //token,
      //newUser: {
        //_id: newUser._id,
        //username: newUser.username,
        //email: newUser.email,
        //role: newUser.role,
      //}, 
    //})

  //} catch (error) {
    //console.log("Error in Sign In", error);
    //res.status(500).json({message: "Server error"});
  //}
//});

// Registro público: SOLO trainers
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validaciones básicas
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    // Bloquea que un correo de admin se cree por esta ruta
    if (ADMIN_WHITELIST.includes(email.toLowerCase())) {
      return res.status(403).json({ message: "Admin accounts cannot be created via public signup." });
    }

    // Unicidad
    const [existingEmail, existingUser] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    if (existingEmail) return res.status(400).json({ message: "Email already in use" });
    if (existingUser) return res.status(400).json({ message: "Username already in use" });

    // Fuerza rol 'trainer' desde el servidor
    const newUser = new User({ email, username, password, role: "trainer" });
    await newUser.save();

    // Token + respuesta estándar
    const token = generateToken(newUser._id, newUser.role);
    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });

    // Aviso (no bloqueante)
    const msg = `Nuevo registro de Entrenador: ${username} <${email}>`;
    notifyAdminsByEmail("Nuevo registro de Entrenador", msg).catch(() => {});
  } catch (error) {
    console.error("Error in Sign Up:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/login', async(req, res) => {
  // Handle login logic here
  try {
    const {email, password} = req.body;

    if (!email || !password) return res.status(400).json({message: "All fields are required"});

    // Check if user exists
    const user = await User.findOne({email});
    if (!user) return res.status(400).json({message: "Invalid credentials"});

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({message: "Invalid credentials"});

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch(error){
    console.log("Error in Login", error);
    res.status(500).json({message: "Server error"});
  }
});

export default router;
