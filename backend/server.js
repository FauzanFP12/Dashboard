// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import insidenRoutes from './routes/insidenRoutes.js'; // Import your routes

// Initialize dotenv to load environment variables
dotenv.config(); 

// Create an express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware for JSON parsing and CORS
app.use(cors());
app.use(express.json()); 

// MongoDB connection using environment variables for the URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use the routes
app.use('/api/insidens', insidenRoutes); 

// Start the server and listen on the designated port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
 