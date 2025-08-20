const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Import all necessary models
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');

// @route   GET /api/analytics/summary
// @desc    Get a summary of key CRM metrics
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id; // Get the user's ID from the auth token

    // --- QUERIES NOW USE THE CORRECT FIELD NAME FOR EACH MODEL ---

    // 1. Count Customers and Opportunities using the 'user' field
    const totalCustomers = await Customer.countDocuments({ user: userId });
    const totalOpportunities = await Opportunity.countDocuments({ user: userId });

    // 2. Count Leads using the 'owner' field
    const totalLeads = await Lead.countDocuments({ owner: userId });

    // 3. Fetch recent customers using the 'user' field
    const recentCustomers = await Customer.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name company');

    // 4. Aggregate sales pipeline from Opportunities using the 'user' field
    const salesPipeline = await Opportunity.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$stage',
          totalValue: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Assemble the final, correct response payload
    const summary = {
      totalCounts: {
        customers: totalCustomers,
        leads: totalLeads,
        opportunities: totalOpportunities,
      },
      salesPipeline,
      recentCustomers,
    };

    res.json(summary);
  } catch (err) {
    console.error('Server Error in analytics route:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
