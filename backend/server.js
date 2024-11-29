import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import helpdeskRoutes from './routes/helpdeskRoutes.js';
import insidenRoutes from './routes/insidenRoutes.js';
import User from './models/User.js';
import { fileURLToPath } from 'url';


import HelpdeskTicket from './models/HelpdeskTicket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// Setup HTTP server and WebSocket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://10.255.254.189:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

// WebSocket connection setup
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for messages from the client
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);

    // You could also target specific rooms or sockets instead of broadcasting to everyone
    io.emit('receiveMessage', {
      message: data.message,
      sender: data.sender,
      timestamp: new Date(),
    });
  });

  // Optional: Listen for typing status (to show 'user is typing...')
  socket.on('typing', (data) => {
    console.log(`${data.sender} is typing...`);
    socket.broadcast.emit('typing', { sender: data.sender });
  });

  // Handle socket disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Middleware setup


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

  const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
};


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5MB
  fileFilter
})


// Middleware to authenticate the token


const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // Menambahkan user ke request
    next();
  });
};


// Login route (access token + refresh token)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ accessToken, refreshToken, role: user.role, fullName: user.fullName });
  } catch (err) {
    console.error('Error in login route:', err);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// Refresh token route
app.post('/api/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ accessToken: newAccessToken });
  });
});

app.post('/api/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'extraField', maxCount: 1 }
]), async (req, res) => {
  // Periksa apakah ada file yang diupload
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const { ticketId, message } = req.body;

  // Periksa apakah ticketId ada dalam body request
  if (!ticketId) {
    return res.status(400).json({ message: 'ticketId is required' });
  }

  try {
    // Cari ticket berdasarkan ticketId
    const ticket = await HelpdeskTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Ambil nama pengirim dari req.user (untuk autentikasi, pastikan req.user ada)
    const fullName = req.headers["full-name"] || "Test"; // Ambil fullName dari header
      
    // Persiapkan dat afile yang diupload
    const filesData = (req.files['file'] || []).map((file) => ({
      filename: file.filename,
      path: `${process.env.BACKEND_URL}/uploads/${file.filename}`, // URL file yang diupload
      size: file.size,
      uploadedAt: Date.now(), // Waktu upload
      fileUrl: `${process.env.BACKEND_URL}/uploads/${file.filename}`,
    }));

    const extraData = (req.files['extraField'] || []).map((file) => ({
      filename: file.filename,
      path: `${process.env.BACKEND_URL}/uploads/${file.filename}`,
      size: file.size,
      uploadedAt: Date.now(),
      fileUrl: `${process.env.BACKEND_URL}/uploads/${file.filename}`,
    }));

    // Siapkan pesan chat untuk ditambahkan ke ticket
    const chatMessage = {
      sender: fullName,  // Ambil sender dari req.user atau gunakan fallback 'System'
      message: message || ' ',  // Set pesan default jika tidak ada
      fileUrl: filesData.length > 0 ? filesData[0].fileUrl : '', // Mengambil file URL pertama (jika ada)
      files: [...filesData, ...extraData], // Gabungkan semua file
      createdAt: Date.now(),  // Waktu pembuatan pesan
    };

    // Push pesan chat ke array chatMessages milik ticket
    ticket.chatMessages.push(chatMessage);

    // Simpan perubahan pada ticket
    await ticket.save();

    res.json({
      message: 'Files uploaded successfully and message added to ticket',
      files: [...filesData, ...extraData],
      ticket,
    });
  } catch (err) {
    console.error('Error in file upload:', err.message);
    res.status(500).json({ message: 'File upload failed.' });
  }
});
app.get('/api/users', async (req, res) => {
  try {
      const users = await User.find(); // Contoh query database
      res.status(200).json(users); // Kirimkan response
  } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
  }
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes for helpdesk tickets and incidents (secured with JWT)
app.use('/api/helpdesk-tickets', helpdeskRoutes);
app.use('/api/insidens', insidenRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Server is running');
});


// Start the server and bind it to all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});
