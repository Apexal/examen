const fs = require('fs');
const path = require('path');
const os = require('os');

const moment = require('moment');

/* GET */
async function redirect_today(ctx) {
  const start = moment().startOf('day').toDate();
  const end = moment().endOf('day').toDate();

  let today;
  try {
    today = await ctx.db.Examen.findOne({
      dateAdded: {
        "$gte": start,
        "$lt": end
      }
    });

    if (today === null) throw new Error('No today\'s examen.');
  } catch (e) {
    return await ctx.redirect('/examen/archive');
  }
  ctx.redirect('/examen/' + today.id);
}

/* GET the form to post a new examen */
async function view_new_examen(ctx) {
  await ctx.render('examen/new');
}

/* POST new examen */
async function save_new_examen(ctx) {
  console.log(ctx.request.body);
  const bdy = ctx.request.body.fields;

  // Parse JSON
  const prompt_texts = JSON.parse(bdy.prompts);
  const prompt_delays = JSON.parse(bdy.delays);
  let prompt_recordings = ctx.request.body.files.recordings;

  const prompts = [];
  for (let i = 0; i < prompt_texts.length; i++) {
    prompts.push({
      text: prompt_texts[i],
      delay: prompt_delays[i]
    });
  }

  const new_examen = new ctx.db.Examen({
    title: bdy.title,
    introduction: bdy.introduction,
    prompts,
    closing: bdy.closing,
    dateAdded: new Date()
  });

  try {
    fs.mkdirSync(path.join(__dirname, '..', '/client/public/audio/examens/', new_examen.id));
  } catch (e) {
    console.log('what');
    console.error(e);
  }
  const save_audio = (file, name) => {
    const reader = fs.createReadStream(file.path);
    const stream = fs.createWriteStream(path.join(__dirname, '..', '/client/public/audio/examens/', new_examen.id, name));
    reader.pipe(stream);
    console.log('uploading %s -> %s', file.name, stream.path);
  }


  // Check for audio file
  const backingTrack = ctx.request.body.files.backingTrack;

  if (backingTrack.size > 0) {
    const ext = backingTrack.name.split('.')[backingTrack.name.split('.').length - 1]; // last part
    const file_name = 'backing_track.' + ext;

    save_audio(backingTrack, file_name);
  }

  const introRecording = ctx.request.body.files.introRecording;
  ['introduction', 'closing'].forEach(t => {
    const f = ctx.request.body.files[t + 'Recording'];
    if (f.size > 0) save_audio(f, t + '.mp3');
  });

  if (prompt_recordings.constructor !== Array) prompt_recordings = [prompt_recordings];
  console.log(prompt_recordings);

  prompt_recordings.forEach((file, i) => save_audio(file, `prompt-${i}.mp3`));

  await new_examen.save();
  ctx.ok('nice');
  //await ctx.redirect('/examen/archive');
}

/* GET one particular examen by ID [maybe date??] */
async function view_examen(ctx) {
  // Find examen
  let examen;
  try {
    // HOW COOL IS THIS
    examen = ctx.state.examen = await ctx.db.Examen.findById(ctx.params.id);
  } catch (e) {
    return ctx.throw(404, 'Examen Not Found');
  }

  ctx.state.autoplay = ctx.query.autoplay === '1';

  ctx.state.title = examen.title;
  await ctx.render('examen/examen');
}

/* GET a list of all posted examens */
async function view_archive(ctx) {
  ctx.state.title = 'Archive';
  ctx.state.examens = await ctx.db.Examen.find();

  await ctx.render('examen/archive');
}

module.exports = {
  redirect_today,
  view_new_examen,
  save_new_examen,
  view_examen,
  view_archive
};