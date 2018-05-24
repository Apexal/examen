const fs = require('fs');
const path = require('path');
const os = require('os');

/* GET the form to post a new examen */
async function view_new_examen(ctx) {
  await ctx.render('examen/new');
}

/* POST new examen */
async function save_new_examen(ctx) {
  console.log(ctx.request.body);
  const bdy = ctx.request.body.fields;

  const new_examen = new ctx.db.Examen({
    title: bdy.title,
    introduction: bdy.introduction,
    prompts: bdy.prompt,
    dateAdded: new Date()
  });

  // Check for audio file
  const file = ctx.request.body.files.recording;

  if (file.size > 0) {
    const ext = file.name.split('.')[file.name.split('.').length - 1]; // last part
    const file_name = new_examen.id + '.' + ext;

    const reader = fs.createReadStream(file.path);
    const stream = fs.createWriteStream(path.join(__dirname, '..', '/client/public/audio/', file_name));
    reader.pipe(stream);
    console.log('uploading %s -> %s', file.name, stream.path);

    new_examen.recording = file_name;
  }

  await new_examen.save();
  await ctx.redirect('/examen/archive');
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
  view_new_examen,
  save_new_examen,
  view_examen,
  view_archive
};