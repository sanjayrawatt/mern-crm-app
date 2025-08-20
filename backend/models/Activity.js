const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  // The user who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // A human-readable description of the action
  // e.g., "changed the stage from 'Qualification' to 'Proposal'"
  description: {
    type: String,
    required: true,
  },
  
  // The type of action (e.g., 'create', 'update', 'note', 'file')
  type: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'NOTE', 'FILE_UPLOAD', 'STATUS_CHANGE'],
  },
  
  // The specific record this activity is related to (e.g., an Opportunity's ID)
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  // The model name of the related record (e.g., 'Opportunity', 'Customer')
  relatedModel: {
    type: String,
    required: true,
    enum: ['Opportunity', 'Customer', 'Lead'],
  },
  
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Activity', ActivitySchema);
