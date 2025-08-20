// 1. Initialize dotenv at the VERY TOP
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Create the Express App ---
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/uploads', express.static('uploads'));

// --- Database Connection ---
const mongoURI = process.env.MONGO_URI;

// Check if the MONGO_URI is loaded correctly
if (!mongoURI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1); // Exit the application with a failure code
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
};

// Call the connect function
connectDB();

// --- Define Routes ---
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/files', require('./routes/fileRoutes')); 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));



// --- Start the Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

