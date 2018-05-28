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
  backingTrackExt: {
    type: String,
    maxlength: 10
  },
  /*audioDuration: {
    type: Number,
    min: 0,
    required: true,
  },*/
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