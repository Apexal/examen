const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/examen');

/* Allows only teachers to use theses routes */
const requireLogin = async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.request.flash('danger', 'You must be logged in to view that page.');
    await ctx.redirect(ctx.router.url('archive'));
  }
};

const requireStaff = async (ctx, next) => {
  if (ctx.isAuthenticated() && !ctx.state.user.isStudent) {
    await next();
  } else {
    ctx.request.flash('danger', 'You must be logged in as a teacher to view that page.');
    await ctx.redirect(ctx.router.url('archive'));
  }
};

router.get('/audio/:audio_id', Ctrl.get_audio);

router.get('/active', requireLogin, Ctrl.redirect_active);

router.get('/new', requireLogin, Ctrl.view_new_examen);
router.post('/new', requireLogin, Ctrl.save_new_examen);

router.post('/:id/schedule', requireStaff, Ctrl.schedule_examen);

router.get('archive', '/archive', Ctrl.view_archive);
router.get('submissions', '/submissions', requireStaff, Ctrl.view_submissions);

router.post('/:id/approve', requireStaff, Ctrl.approve_examen);
router.post('/:id/deny', requireStaff, Ctrl.deny_examen);

router.get('examen', '/:id', Ctrl.view_examen);
router.post('/:id/remove', requireStaff, Ctrl.remove_examen);

module.exports = router.routes();