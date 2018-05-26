const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  introduction: {
    type: String,
    required: true,
    maxlength: 10000
  },
  prompts: [{
    text: {
      type: String,
      required: true
    },
    delay: {
      type: Number,
      min: 0,
      max: 600,
      required: true
    }
  }],
  closing: {
    type: String,
    required: true,
    maxlength: 10000
  },
  dateAdded: {
    type: Date,
    required: true
  }
});

module.exports = {
  name: 'Examen',
  schema
};