const Koa = require('koa');
const Body = require('koa-body');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Helmet = require('koa-helmet');
const serve = require('koa-better-serve');
const respond = require('koa-respond');
const compress = require('kompression');
const views = require('koa-views');
const session = require('koa-session');
const db = require('./db');
const static = require('koa-static');
const passport = require('./auth');

const config = require('config');

const app = new Koa();
const router = new Router();

app.keys = config.get('keys');

app.use(
  compress({
    filter: function (content_type) {
      return /text/i.test(content_type);
    },
    threshold: 2048
  })
);

/* Serve static files (CSS, JS, audio, etc.) */
app.use(static('client/public'));

/* Session setup */
app.use(session(app));

/* Passport auth setup */
app.use(passport.initialize());
app.use(passport.session());

/* MongoDB setup */
app.context.db = db;

app.context.helpers = require('./helpers');

/* Locals */
app.use(async (ctx, next) => {
  // Create flash session object if does not exist yet (first request)
  if (ctx.session.flash === undefined) {
    ctx.session.flash = {};
  }

  // Inject flash function into request
  ctx.request.flash = (type, msg) => {
    ctx.session.flash[type] = msg;
  };

  // Empty the flash but before that pass it to the state to use in views
  ctx.state.flash = ctx.session.flash;
  ctx.session.flash = {};

  ctx.state.path = ctx.request.url;

  // To use in views
  ctx.state.helpers = ctx.helpers;
  ctx.state.loggedIn = ctx.isAuthenticated();
  ctx.state.moment = require('moment');

  await next();

  // Keep flash on redirect so it is not lost
  if (ctx.status === 302 && ctx.session && !(ctx.session.flash)) {
    ctx.session.flash = ctx.state.flash;
  }
});

/* Sets basic security measures */
app.use(Helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(Logger());
}

/* Allows request body parsing */
app.use(Body({
  multipart: true
}));

/* Adds helpful response methods */
app.use(respond());

/* Error handling */
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status == 404) ctx.throw(404, 'Page Not Found');
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.state.error = err;
    ctx.app.emit('error', err, ctx);

    await ctx.render('error');
  }
});

/* Views setup using Pug */
app.use(
  views(__dirname + '/views', {
    extension: 'pug'
  })
);

/* Router setup */
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

/* Bring user to Google login asking for permission */
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

/* Actually login once returned from the Google login site */
router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
  })
);

/* Logout with Passport and redirect home with flash */
router.get('/logout', ctx => {
  ctx.logout();
  ctx.request.flash('success', 'Successfully logged out.');
  ctx.redirect('/');
});

module.exports = app;