async function view_archive(ctx) {
  ctx.state.title = 'Archive';

  ctx.state.examens = await ctx.db.Examen.find();

  await ctx.render('examen/archive');
}

module.exports = { view_archive };
