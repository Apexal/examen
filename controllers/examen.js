/* GET the form to post a new examen */
async function view_new_examen(ctx) {
  await ctx.render('examen/new');
}

/* POST */
async function save_new_examen(ctx) {
  console.log(ctx.request.body);
  const bdy = ctx.request.body;

  const new_examen = new ctx.db.Examen({
    title: bdy.title,
    introduction: bdy.introduction,
    prompts: bdy.prompt,
    dateAdded: new Date()
  })

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