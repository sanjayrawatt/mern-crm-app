const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    // Note: Email here is not unique, as multiple leads might come from the same email initially,
    // or we might not have it for all leads.
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'], // Define possible lead statuses
    default: 'New'
  },
  source: {
    type: String, // e.g., 'Website', 'Referral', 'Cold Call', 'Event'
    trim: true
  },
  notes: {
    type: String
  },
  // The user who owns this lead record
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to the User model
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Lead', leadSchema);
