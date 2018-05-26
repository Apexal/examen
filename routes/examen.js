const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/examen');

router.get('/today', Ctrl.redirect_today);

router.all(['/new', '/:id/remove'], async (ctx, next) => {
  if (ctx.isAuthenticated() && ctx.state.user.isStudent) {
    await next();
  } else {
    await ctx.redirect('/examen/archive');
  }
});

router.get('/new', Ctrl.view_new_examen);
router.post('/new', Ctrl.save_new_examen);

router.get('archive', '/archive', Ctrl.view_archive);

router.get('examen', '/:id', Ctrl.view_examen);
router.post('/:id/remove', Ctrl.remove_examen);

module.exports = router.routes();