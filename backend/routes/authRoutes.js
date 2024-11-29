import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';  // Make sure this model includes a fullName field
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);  // Check password match

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with fullName and role
    const token = jwt.sign(
      { id: user._id, username: user.username, fullName: user.fullName, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }  // Token expires in 3 hours
    );

    res.json({ token, fullName: user.fullName, role: user.role });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Register endpoint (for normal users)
router.post('/register', async (req, res) => {
  const { username, password, fullName } = req.body; // Make sure fullName is passed

  // Validate input
  if (!username || !password || !fullName) {
    return res.status(400).json({ message: 'Username, password, and fullName are required' });
  }

  try {
    const normalizedUsername = username.toLowerCase();

    // Check if user with the given username already exists
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user to database
    const newUser = new User({
      username: normalizedUsername,
      password: hashedPassword,
      fullName: fullName // Store fullName
    });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register Admin (used only once for the first admin user creation)
router.post('/register-admin', async (req, res) => {
  const { username, password, fullName } = req.body; // Include fullName for admin as well

  // Validate input
  if (!username || !password || !fullName) {
    return res.status(400).json({ message: 'Username, password, and fullName are required' });
  }

  try {
    const normalizedUsername = username.toLowerCase();

    // Check if admin user already exists
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Check if user with the same username already exists
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newUser = new User({
      username: normalizedUsername,
      password: hashedPassword,
      fullName: fullName // Store fullName for admin
    });

    await newUser.save();

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
