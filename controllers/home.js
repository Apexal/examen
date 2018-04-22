async function index(ctx) {
  ctx.state.title = 'Home';
  await ctx.render('index');
}

async function reply(ctx) {
  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
  ctx.body = n + ' views';
}

module.exports = { index, reply };
