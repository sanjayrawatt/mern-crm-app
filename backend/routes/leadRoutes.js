const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead'); // Path to your Lead model
const auth = require('../middleware/auth'); // Your authentication middleware

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newLead = new Lead({
      ...req.body,
      owner: req.user.id // Assign the authenticated user as the owner
    });

    const lead = await newLead.save();
    res.status(201).json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/leads
// @desc    Get all leads (owned by the authenticated user)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query; // Add page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let query = { owner: req.user.id };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        ...query,
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { source: { $regex: searchRegex } },
        ],
      };
    }

    const totalLeads = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalLeads / limitNum);

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      leads,
      currentPage: pageNum,
      totalPages,
      totalLeads,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user.id });

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
      return res.status(400).json({ msg: 'Invalid Lead ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/leads/:id
// @desc    Update a lead by ID
// @access  Private
router.patch('/:id', auth, async (req, res) => {
  try {
    let lead = await Lead.findOne({ _id: req.params.id, owner: req.user.id });

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Update the lead fields
    Object.assign(lead, req.body);
    await lead.save();

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Lead ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Lead ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
