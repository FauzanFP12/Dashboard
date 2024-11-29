import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js'; // Adjust path if necessary

dotenv.config(); // Load environment variables

// Check that the MongoDB URI is loaded
if (!process.env.MONGO_URI) {
  console.error("MongoDB URI not found in environment variables.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    const users = [
      { username: 'admin', password: 'adminpassword', role: 'admin', fullName: 'Admin' },
      { username: 'user1', password: 'password1', role: 'user', fullName: 'User One' },
      { username: 'user2', password: 'password2', role: 'user', fullName: 'User Two' },
      { username: 'user3', password: 'password3', role: 'user', fullName: 'User Three' },
      { username: 'user4', password: 'password4', role: 'user', fullName: 'User Four' },
      { username: 'user5', password: 'password5', role: 'user', fullName: 'User Five' },
      { username: 'user6', password: 'password6', role: 'user', fullName: 'User Six' },
      { username: 'user7', password: 'password7', role: 'user', fullName: 'User Seven' },
      { username: 'user8', password: 'password8', role: 'user', fullName: 'User Eight' },
      { username: 'user9', password: 'password9', role: 'user', fullName: 'User Nine' },
      { username: 'user10', password: 'password10', role: 'user', fullName: 'User Ten' },
    ];

    // Hash passwords and create users
    const hashedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }));

    // Save users to the database
    await User.insertMany(hashedUsers);
    console.log('10 users created successfully');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  })
  .finally(() => {
    mongoose.connection.close(); // Close the connection regardless of outcome
  });
