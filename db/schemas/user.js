const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _google_id: {
    type: String,
    required: true
  },
  _school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
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
  admin: {
    type: Boolean,
    default: false,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    required: true
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
  return this.admin ? 'Admin' : '';
});

schema.virtual('fullName').get(function () {
  return this.name.first + ' ' + this.name.last;
});

module.exports = {
  name: 'User',
  schema
};