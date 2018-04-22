function index(ctx) {
  ctx.body = 'hello world';
}

function reply(ctx) {
  let user = ctx.request.query.user;
  ctx.body = `Hello ${user}`;
}

module.exports = { index, reply };
