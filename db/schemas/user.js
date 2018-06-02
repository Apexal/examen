const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _google_id: {
    type: String,
    required: true
  },
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
      type: String,
      required: true
    }
  },
  isStudent: {
    type: Boolean,
    required: true,
    default: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dateJoined: {
    type: Date,
    required: true
  }
});

/*
schema.virtual('examens', {
  ref: 'Examen',
  localField: '_id',
  foreignField: '_poster'
});
*/

schema.virtual('title').get(function () {
  return this.isStudent ? 'Student' : 'Staff';
});

schema.virtual('fullName').get(function () {
  return this.name.first + ' ' + this.name.last;
});

module.exports = {
  name: 'User',
  schema
};