async function index(ctx) {
  ctx.state.title = 'Home';
  await ctx.render('index');
}

async function reply(ctx) {
  let user = ctx.request.query.user;
  ctx.body = `Hello ${user}`;
}

module.exports = { index, reply };
