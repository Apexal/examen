const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/examen');

/* Allows only teachers to use theses routes */
router.all(['/new', '/:id/remove'], async (ctx, next) => {
  if (ctx.isAuthenticated() /*&& ctx.state.user.isStudent*/ ) { // TODO: switch to staff
    await next();
  } else {
    ctx.request.flash('danger', 'You must be logged in as a teacher to view that page.');
    await ctx.redirect(ctx.router.url('archive'));
  }
});

router.get('/today', Ctrl.redirect_today);

router.get('/new', Ctrl.view_new_examen);
router.post('/new', Ctrl.save_new_examen);

router.get('archive', '/archive', Ctrl.view_archive);

router.get('examen', '/:id', Ctrl.view_examen);
router.post('/:id/remove', Ctrl.remove_examen);

module.exports = router.routes();