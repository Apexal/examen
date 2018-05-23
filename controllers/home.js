async function index(ctx) {
  ctx.state.title = 'Home';
  await ctx.render('index');
}

module.exports = { index };
