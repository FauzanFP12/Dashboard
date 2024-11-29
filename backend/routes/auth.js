const express = require('express');
const bcrypt = require('bcrypt');  // Jika Anda menggunakan bcrypt untuk hashing password
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Mengimpor model User
const router = express.Router();

// Endpoint untuk login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari pengguna berdasarkan username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verifikasi password dengan bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Membuat JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET,  // Gunakan secret key dari environment variables
      { expiresIn: '1h' }     // Set waktu kadaluarsa token
    );

    // Kirimkan response dengan token dan data pengguna
    res.json({
      token,
      role: user.role,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
