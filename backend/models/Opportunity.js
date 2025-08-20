const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  title: { type: String, required: true },
  value: { type: Number, required: true },
  stage: {
    type: String,
    enum: ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Qualification',
  },
  expectedCloseDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);
