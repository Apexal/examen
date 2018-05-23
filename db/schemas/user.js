const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _google_id: { type: String, required: true },
  isStudent: { type: Boolean, required: true },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true }
  },
  email: { type: String, required: true, unique: true },
  dateJoined: { type: Date, required: true }
});

module.exports = { name: 'User', schema };