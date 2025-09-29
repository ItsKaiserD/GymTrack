import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'});
}

router.post('/sign_in', async(req, res) => {
  // Handle login logic here
  try {
    const {email, username, password} = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({message: "All fields are required"});
    }

    if (password.length < 6) {
      return res.status(400).json({message: "Password must be at least 6 characters"});
    }

    if (username.length < 3) {
      return res.status(400).json({message: "Username must be at least 3 characters"});
    }

    // Check if user already exists
    const existingEmail = await User.findOne({email});
    if (existingEmail) {
      return res.status(400).json({message: "Email already in use"});
    }

    const existingUsername = await User.findOne({username});
    if (existingUsername) {
      return res.status(400).json({message: "Username already in use"});
    }

    // Create new user
    const newUser = new User({
      email, 
      username, 
      password
    });

    await newUser.save();

    // Generate JWT
    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      newUser: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }, 
    })

  } catch (error) {
    console.log("Error in Sign In", error);
    res.status(500).json({message: "Server error"});
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
        email: user.email
      }
    });
  } catch(error){
    console.log("Error in Login", error);
    res.status(500).json({message: "Server error"});
  }
});

export default router;
