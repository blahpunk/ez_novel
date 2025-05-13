const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chapter = require('../models/Chapter');

// Save chapter
router.put('/chapters/:id', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, updatedAt: Date.now() },
      { new: true }
    );
    res.json(chapter);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add similar routes for characters, locations, etc.
