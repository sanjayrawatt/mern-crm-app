const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User'); // We need this to populate the user's name

// @route   GET /api/activities/:model/:id
// @desc    Get all activities for a specific record
// @access  Private
router.get('/:model/:id', auth, async (req, res) => {
  try {
    const { model, id } = req.params;

    // Optional: A quick validation to ensure the model name is one we expect
    const allowedModels = ['Opportunity', 'Customer', 'Lead'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ msg: 'Invalid model type provided.' });
    }

    const activities = await Activity.find({
      relatedModel: model,
      relatedTo: id
    })
    .populate('user', 'name') // Populate the 'user' field to get the user's name
    .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.json(activities);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
