const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  // The unique name of the file stored on the server
  filename: { type: String, required: true },
  
  // The original name of the file from the user's computer
  originalname: { type: String, required: true },
  
  // The path where the file is stored on the server (e.g., 'uploads/1668832.pdf')
  path: { type: String, required: true },
  
  // The file's MIME type (e.g., 'application/pdf', 'image/png')
  mimetype: { type: String, required: true },
  
  // The size of the file in bytes
  size: { type: Number, required: true },
  
  // The user who uploaded the file
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // The specific record this file is attached to (e.g., an Opportunity's ID)
  relatedTo: { type: mongoose.Schema.Types.ObjectId, required: true },

  // The name of the model this file is related to (e.g., 'Opportunity', 'Customer')
  relatedModel: { type: String, required: true, enum: ['Opportunity', 'Customer', 'Lead'] },

}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('File', FileSchema);
