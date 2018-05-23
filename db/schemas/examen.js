const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  introduction: { type: String, required: true, maxlength: 10000 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  dateAdded: { type: Date, required: true }
});

module.exports = { name: 'Examen', schema };