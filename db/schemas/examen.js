const path = require('path');
const rimraf = require('rimraf');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paginate = require('mongoose-paginate');

const schema = new Schema({
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
    }
  },
  backingTrackExt: {
    type: String,
    maxlength: 10
  },
  _poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    min: 0,
    default: 0,
    //required: true,
  },
  dateAdded: {
    type: Date,
    required: true
  }
});

schema.plugin(paginate);

/* When an examen is deleted, its recording folder should also be deleted. */
schema.pre('remove', function (next) {
  const dir = path.join(__dirname, '..', '..', '/client/public/audio/examens/', this.id);
  console.log(`Removing examen and dir: ${dir}`);
  rimraf(dir, next);
});

module.exports = {
  name: 'Examen',
  schema
};