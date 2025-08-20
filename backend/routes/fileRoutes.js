const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const File = require('../models/File');

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/:model/:id', auth, async (req, res) => {
  try {
    const { model, id } = req.params;

    // Validate the model to prevent arbitrary queries
    const allowedModels = ['Opportunity', 'Customer', 'Lead'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ msg: 'Invalid model type.' });
    }

    const files = await File.find({
      relatedModel: model,
      relatedTo: id
    }).sort({ createdAt: -1 }); // Show the newest files first

    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/files/upload
// @desc    Upload a file and link it to a record
// @access  Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  // 'file' in upload.single('file') must match the name attribute of the file input in the frontend form
  
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    // Get the related record info from the request body
    const { relatedTo, relatedModel } = req.body;
    if (!relatedTo || !relatedModel) {
      return res.status(400).json({ msg: 'Related record information is missing.' });
    }

    // Create a new file document to save in the database
    const newFile = new File({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      user: req.user.id,
      relatedTo: relatedTo,
      relatedModel: relatedModel
    });

    await newFile.save();
    
    // Send the new file's data back to the client
    res.status(201).json(newFile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
