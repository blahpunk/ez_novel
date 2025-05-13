const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  title: String,
  content: Object, // Draft.js content state
  order: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Chapter', ChapterSchema);
