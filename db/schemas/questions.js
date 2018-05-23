const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  examen: { type: mongoose.Schema.Types.ObjectId, ref: 'Examen' },
  title: { type: String, required: true, maxlength: 200 },
  text: { type: String, required: true, maxlength: 2000 },
  dateAdded: { type: Date, required: true }
});

module.exports = { name: 'Question', schema };