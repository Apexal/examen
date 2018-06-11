const fs = require('fs');
const path = require('path');
const os = require('os');
const moment = require('moment');
const mongoose = require('mongoose');
const Feed = require('feed');

const {
  sendEmail
} = require('../email');

/* GET the active examen for your school or redirect to archive if none */
// "/examens/active"
async function redirect_active(ctx) {
  const now = Date.now();
  let active;
  try {
    active = await ctx.db.Examen.findOne({
      _school: ctx.state.user._school._id,
      startActive: {
        $lte: now
      },
      endActive: {
        $gte: now
      }
    }).sort({
      dateAdded: -1
    });

    if (active === null) {
      ctx.request.flash('warning', `There's currently no active examen for ${ctx.state.user._school.name}.`);
      throw new Error(`There's currently no active examen for ${ctx.state.user._school.name}.`);
    }
  } catch (e) {
    console.error(e);
    return await ctx.redirect('/examen/archive');
  }
  ctx.redirect(ctx.router.url('examen', active.id));
}

/* GET the form to post a new examen */
// "/examens/new"
async function view_new_examen(ctx) {
  ctx.state.title = 'New Examen';
  await ctx.render('examen/new');
}

/* POST new examen */
// "/examens/new"
async function save_new_examen(ctx, next) {
  const bdy = ctx.request.body.fields;

  // Parse JSON
  const prompt_texts = JSON.parse(bdy.prompts);
  const prompt_delays = JSON.parse(bdy.delays);
  const prompt_durations = JSON.parse(bdy.durations);
  let prompt_recordings = ctx.request.body.files.recordings;

  let introduction = {
    text: bdy.introduction,
    delay: bdy.introductionDelay,
    duration: bdy.introductionDuration
  };

  let closing = {
    text: bdy.closing,
    delay: bdy.closingDelay,
    duration: bdy.closingDuration
  };

  // Reconstruct prompt array by matching up text and delays
  const prompts = [];
  for (let i = 0; i < prompt_texts.length; i++) {
    prompts.push({
      text: prompt_texts[i],
      delay: prompt_delays[i],
      duration: prompt_durations[i]
    });
  }

  // Save the audio file locally with the given name
  const save_audio = (file, prompt) => {
    const reader = fs.createReadStream(file.path);
    //const stream = fs.createWriteStream(path.join(examenDir, name));
    const audio_id = mongoose.Types.ObjectId();

    const gridfs = require('mongoose-gridfs')({
      collection: 'recordings',
      model: 'Recording',
      mongooseConnection: mongoose.connection
    });
    Recording = gridfs.model;

    Recording.write({
      _id: audio_id,
      filename: audio_id + '.ogg',
      content_type: 'audio/ogg'
    }, reader);

    prompt.audio_id = audio_id;
    console.log('uploading %s -> gridfs at %s', file.path, audio_id);
  }

  save_audio(ctx.request.body.files.introductionRecording, introduction);
  save_audio(ctx.request.body.files.closingRecording, closing);

  // When only one prompt is sent, its not sent as an array 
  if (prompt_recordings.constructor !== Array) prompt_recordings = [prompt_recordings];

  // Save each prompt recording
  prompt_recordings.forEach((file, i) => save_audio(file, prompts[i]));

  const new_examen = new ctx.db.Examen({
    _school: ctx.state.user._school,
    title: bdy.title,
    backingTrack: bdy.backingTrack,
    introduction,
    approved: !ctx.state.user.isStudent,
    prompts,
    closing,
    _poster: ctx.state.user._id,
    visibility: bdy.visibility,
    dateAdded: new Date()
  });

  await new_examen.save();

  if (ctx.state.user.isStudent) {
    ctx.request.flash('success', `Successfully submitted examen '${new_examen.title}' for approval.`);
  } else {
    ctx.request.flash('success', `Successfully posted examen '${new_examen.title}'.`);
  }

  ctx.created({
    success: true,
    id: new_examen.id
  });
}

/* POST set start and end dates for an examen to be "active" */
// "/examen/:id/schedule"
async function schedule_examen(ctx) {
  const id = ctx.params.id;

  // Parse dates using MomentJS
  const startDate = moment(ctx.request.body['start-date'], 'YYYY-MM-DD');
  const endDate = moment(ctx.request.body['end-date'], 'YYYY-MM-DD');

  // Validate dates
  if (startDate.isAfter(endDate) || startDate.isSame(endDate, 'day')) return ctx.throw(400, 'Dates out of order.');

  let examen;
  try {
    examen = await ctx.db.Examen.findById(id);
  } catch (e) {
    return ctx.throw(404, 'Examen Not Found');
  }

  // Validate dates make sense
  if (examen.visibility !== 'school') return ctx.throw(400, 'Can only schedule school examens.');
  if (startDate.isBefore(moment())) return ctx.throw(400, 'Cannot schedule examens to the past.');

  examen.startActive = startDate;
  examen.endActive = endDate;

  await examen.save();

  ctx.request.flash('success', `Successfully scheduled examen '${examen.title}'.`);
  ctx.redirect('back');
}

/* POST remove examen */
// "/examens/:id/remove"
async function remove_examen(ctx) {
  const id = ctx.params.id;
  let examen;
  try {
    examen = await ctx.db.Examen.findById(id);
  } catch (e) {
    return ctx.throw(404, 'Examen Not Found');
  }

  // This also deletes the audio folder
  await examen.remove();
  ctx.request.flash('success', `Successfully removed examen '${examen.title}'.`);
  ctx.redirect(ctx.router.url('archive'));
}

/* POST approve examen */
// "/examens/:id/approve"
async function approve_examen(ctx) {
  const id = ctx.params.id;
  let examen;
  try {
    examen = await ctx.db.Examen.findById(id);
  } catch (e) {
    return ctx.throw(404, 'Examen Not Found');
  }

  // Don't allow re-approving
  if (examen.approved) return ctx.throw(400, 'Examen is already approved.');

  examen.approved = true;

  sendEmail(ctx.state.user.email, 'Examen Approved', 'examenApproved', {
    name: ctx.state.user.name,
    examen,
    directLink: 'https://ignatian-examen.herokuapp.com/examen/' + examen.id,
    school: ctx.state.user._school
  });

  await examen.save();
  ctx.request.flash('success', `Successfully approved examen '${examen.title}'.`);
  ctx.redirect(ctx.router.url('submissions'));
}

/* POST deny (and delete) examen */
// "/examens/:id/deny"
async function deny_examen(ctx) {
  const id = ctx.params.id;
  let examen;
  try {
    examen = await ctx.db.Examen.findById(id);
  } catch (e) {
    return ctx.throw(404, 'Examen Not Found');
  }

  // Don't allow denial of already approved examen
  if (examen.approved) return ctx.throw(400, 'Cannot deny already approved examen.');

  sendEmail(ctx.state.user.email, 'Examen Denied', 'examenDenied', {
    name: ctx.state.user.name,
    examen
  });

  await examen.remove();
  ctx.request.flash('success', `Successfully denied (and deleted) examen '${examen.title}'.`);
  ctx.redirect(ctx.router.url('submissions'));
}

/* GET one particular examen by ID */
// "/examens/:id"
async function view_examen(ctx) {
  // Find examen
  let examen;
  try {
    examen = ctx.state.examen = await ctx.db.Examen.findById(ctx.params.id).populate('_poster', '_id name email isStudent').populate('_school');
    if (!examen) throw new Error('Examen not found');
  } catch (e) {
    console.error(e);
    return ctx.throw(404, 'Examen Not Found');
  }

  if (ctx.isAuthenticated() && ctx.state.user.isStudent && !examen.approved) return ctx.throw(403, 'This examen has not been approved yet.');

  // Respect visibility
  if ((examen.visibility === 'school' && !ctx.isAuthenticated()) || (examen.visibility === 'school' && !examen._school._id.equals(ctx.state.user._school._id)))
    ctx.throw(403, 'This examen is only viewable to the poster\'s school members.');

  if ((examen.visibility === 'private' && !ctx.isAuthenticated()) || (examen.visibility === 'private' && !examen._poster._id.equals(ctx.state.user._id)))
    ctx.throw(403, 'This examen is only viewable by it\'s poster.');

  ctx.state.autoplay = ctx.query.autoplay === '1';

  ctx.state.title = examen.title;
  await ctx.render('examen/examen');
}

/* GET a list of all posted examens */
// "/examens/archive"
async function view_archive(ctx) {
  ctx.state.title = 'Archive';

  // Prevent going to negative pages
  let page = ctx.state.page = Math.max(1, ctx.query.page || 1);
  ctx.state.prevPage = Math.max(1, page - 1);
  ctx.state.nextPage = page + 1;

  // Limit to only 4 per page
  const query = {
    approved: true
  };
  if (ctx.isAuthenticated()) {
    query['$or'] = [{
        visibility: 'public'
      }, {
        visibility: 'school',
        _school: ctx.state.user._school._id
      },
      {
        visibility: 'private',
        _poster: ctx.state.user._id
      }
    ];
  } else {
    query.visibility = 'public';
  }

  const data = ctx.state.data = await ctx.db.Examen.paginate(query, {
    sort: {
      dateAdded: -1
    },
    populate: ['_poster', '_school'],
    limit: 4,
    page
  });

  // If too high, go to last page
  if (page > data.pages) return ctx.redirect('/examen/archive?page=' + data.pages);

  await ctx.render('examen/archive');
}

/* GET a page of pending student examens */
// "/examens/submissions"
async function view_submissions(ctx) {
  ctx.state.title = 'Submissions';

  // Prevent going to negative pages
  let page = ctx.state.page = Math.max(1, ctx.query.page || 1);
  ctx.state.prevPage = Math.max(1, page - 1);
  ctx.state.nextPage = page + 1;

  // Limit to only 4 per page
  const data = ctx.state.data = await ctx.db.Examen.paginate({
    approved: false,
    _school: ctx.state.user._school._id
  }, {
    sort: {
      dateAdded: -1
    },
    populate: '_poster',
    limit: 20,
    page
  });

  // If too high, go to last page
  if (page > data.pages) return ctx.redirect('/examen/submissions?page=' + data.pages);

  await ctx.render('examen/submissions');
}

async function get_audio(ctx) {
  const audio_id = ctx.params.audio_id;
  const gridfs = require('mongoose-gridfs')({
    collection: 'recordings',
    model: 'Recording',
    mongooseConnection: mongoose.connection
  });
  Recording = gridfs.model;

  const data = await Recording.readById(audio_id);
  ctx.body = data;
}

async function get_feed(ctx) {
  const feed = new Feed({
    title: 'Ignatian Examen',
    description: 'Student and teacher generated examens.',
    id: 'https://ignatian-examen.herokuapp.com/',
    link: 'https://ignatian-examen.herokuapp.com/',
    //image: '',
    //favicon: '',
    author: {
      name: 'Frank Matranga',
      email: 'thefrankmatranga@gmail.com',
      link: 'http://frankmatranga.me'
    }
  });

  const examens = await ctx.db.Examen.find({
    visibility: 'public'
  }).limit(10);

  examens.forEach(ex => feed.addItem({
    title: ex.title,
    id: ex._id,
    link: `https://ignatian-examen.herokuapp.com/examen/${ex._id}`,
    description: ex.totalDuration + ' seconds long',
    date: ex.dateAdded
  }));

  if (ctx.params.format === 'rss') {
    ctx.type = 'application/rss+xml';
    ctx.body = feed.rss2();
  } else if (ctx.params.format === 'atom') {
    ctx.type = 'application/atom+xml';
    ctx.body = feed.atom1();
  } else if (ctx.params.format === 'json') {
    ctx.type = 'application/json';
    ctx.body = feed.json1();
  } else {
    ctx.badRequest('Invalid feed format.');
  }
}

module.exports = {
  redirect_active,
  view_new_examen,
  save_new_examen,
  schedule_examen,
  remove_examen,
  approve_examen,
  deny_examen,
  view_examen,
  view_archive,
  view_submissions,
  get_audio,
  get_feed
};