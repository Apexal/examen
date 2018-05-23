const passport = require('koa-passport');

// TODO: const User = require('./db').User;

passport.serializeUser((user, done) => {
    done(null, user._id)
});
  
passport.deserializeUser((id, done) => {
    User.findById(id, done);
});

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy({
    clientId: '',
    clientSecret: '',
    callbackURL: '' + '/auth/google/callback'
  },
  (token, tokenSecret, profile, done) => {
    // Find user
    User.findOne({ google_id: profile.id }, done);
  }
));

module.exports = passport;
