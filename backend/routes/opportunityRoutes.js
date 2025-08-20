const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Opportunity = require('../models/Opportunity');
const Customer = require('../models/Customer');

// Import the activity logging service
const { logActivity } = require('../services/activityService');

// @route   GET /api/opportunities
// @desc    Get all opportunities for a user (with search and pagination)
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { stage: { $regex: search, $options: 'i' } },
      ];
    }

    const totalOpportunities = await Opportunity.countDocuments(query);
    const totalPages = Math.ceil(totalOpportunities / limit);

    const opportunities = await Opportunity.find(query)
      .populate('customer', 'name company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ opportunities, currentPage: Number(page), totalPages });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST /api/opportunities
// @desc    Create a new opportunity
router.post('/', auth, async (req, res) => {
  const { title, customer: customerId, value, stage, expectedCloseDate, notes } = req.body;
  try {
    const customer = await Customer.findOne({ _id: customerId, user: req.user.id });
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found or does not belong to you' });
    }

    const newOpportunity = new Opportunity({
      user: req.user.id,
      customer: customerId,
      title, value, stage, expectedCloseDate, notes,
    });

    const opportunity = await newOpportunity.save();

    // --- LOG ACTIVITY: CREATE ---
    await logActivity(
      req.user.id,
      'CREATE',
      `created a new opportunity: "${opportunity.title}"`,
      opportunity._id,
      'Opportunity'
    );

    res.status(201).json(opportunity); // Changed to 201 for resource creation
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PATCH /api/opportunities/:id
// @desc    Update an opportunity
router.patch('/:id', auth, async (req, res) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ msg: 'Opportunity not found' });
    if (opportunity.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // --- LOG ACTIVITY: UPDATE ---
    // Compare old stage with new stage to create a detailed log message
    const oldStage = opportunity.stage;
    const newStage = req.body.stage;
    if (newStage && oldStage !== newStage) {
      await logActivity(
        req.user.id,
        'STATUS_CHANGE',
        `changed stage from "${oldStage}" to "${newStage}" for opportunity: "${opportunity.title}"`,
        opportunity._id,
        'Opportunity'
      );
    } else {
      // Generic update log if stage didn't change
      await logActivity(
        req.user.id,
        'UPDATE',
        `updated details for opportunity: "${opportunity.title}"`,
        opportunity._id,
        'Opportunity'
      );
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('customer', 'name company');

    res.json(updatedOpportunity);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE /api/opportunities/:id
// @desc    Delete an opportunity
router.delete('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ msg: 'Opportunity not found' });
    if (opportunity.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    // --- LOG ACTIVITY: DELETE ---
    await logActivity(
      req.user.id,
      'DELETE',
      `deleted opportunity: "${opportunity.title}"`,
      req.params.id, // Use the ID from params as the record is now gone
      'Opportunity'
    );

    res.json({ msg: 'Opportunity removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
