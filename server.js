const Koa = require('koa');
const Body = require('koa-body');
const Router = require('koa-router');
const Logger = require('koa-logger');
const Helmet = require('koa-helmet');
const respond = require('koa-respond');

const app = new Koa();
const router = new Router();

app.use(Helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(Logger());
}
app.use(Body());
app.use(respond());

require('./routes')(router);
app.use(router.routes()).use(router.allowedMethods());

module.exports = app;
