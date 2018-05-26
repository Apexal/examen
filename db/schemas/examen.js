const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  introduction: {
    text: {
      type: String,
      required: true,
      maxlength: 10000
    },
    delay: {
      type: Number,
      min: 0,
      max: 600,
      required: true
    }
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
    text: {
      type: String,
      required: true,
      maxlength: 10000
    },
    delay: {
      type: Number,
      min: 0,
      max: 600,
      required: true
    }
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