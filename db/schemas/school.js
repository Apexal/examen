const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  // e.g. regis.org
  domain: {
    type: String,
    required: true
  },
  theme: {
    primary: String,
    secondary: String,
  },
  dateAdded: {
    type: Date,
    required: true
  }
});

module.exports = {
  name: 'School',
  schema
};