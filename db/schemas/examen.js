const moment = require('moment');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paginate = require('mongoose-paginate');

const schema = new Schema({
  _school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  approved: {
    type: Boolean,
    default: true,
    required: true
  },
  startActive: Date,
  endActive: Date,
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
    },
    audio_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
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
    },
    audio_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
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
    },
    audio_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    }
  },
  backingTrack: {
    type: String,
    required: true,
    maxlength: 300
  },
  _poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'school', 'public'],
    default: 'public',
    required: true
  },
  dateAdded: {
    type: Date,
    required: true
  }
});

schema.plugin(paginate);

/* When an examen is deleted, its recording folder should also be deleted. */
schema.pre('remove', function (next) {
  const gridfs = require('mongoose-gridfs')({
    collection: 'recordings',
    model: 'Recording',
    mongooseConnection: mongoose.connection
  });
  Recording = gridfs.model;

  try {
    Recording.unlinkById(this.introduction.audio_id, () => {});
  } catch (e) {

  }
  try {
    Recording.unlinkById(this.closing.audio_id, () => {});
  } catch (e) {

  }
  try {
    this.prompts.map(p => Recording.unlinkById(p.audio_id, () => {}));
  } catch (e) {

  }
  return next();
});

schema.virtual('isActive').get(function () {
  const today = moment().startOf('day');
  if (!this.startActive || !this.endActive) return false;
  return today.isBetween(this.startActive, this.endActive);
});

schema.virtual('totalDuration').get(function () {
  return this.introduction.duration + this.prompts.reduce((acc, p) => acc + p.duration, 0) + this.closing.duration;
});

module.exports = {
  name: 'Examen',
  schema
};