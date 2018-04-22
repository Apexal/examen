const Koa = require('koa');
const Body = require('koa-body');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Helmet = require('koa-helmet');
const serve = require('koa-better-serve');
const respond = require('koa-respond');
const compress = require('kompression');

const app = new Koa();
const router = new Router();

app.use(
  compress({
    filter: function(content_type) {
      return /text/i.test(content_type);
    },
    threshold: 2048
  })
);

/* Sets basic security measures */
app.use(Helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(Logger());
}

/* Allows request body parsing */
app.use(Body());

/* Adds helpful response methods */
app.use(respond());

/* Router setup */
require('./routes')(router);
app.use(router.routes()).use(router.allowedMethods());

/* Static file serving */
app.use(serve('./public/images', '/images'));

module.exports = app;
