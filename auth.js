const config = require('config');
const passport = require('koa-passport');

// TODO: remove
const User = {
    _id: 1,
    id: "1",
    name: 'Frank'
}

// TODO: const User = require('./db').User;

passport.serializeUser((user, done) => {
    done(null, user._id)
});
  
passport.deserializeUser((id, done) => {
    done(null, User);
    //User.findById(id, done);
});

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy(config.get('auth.google'),
  (token, tokenSecret, profile, done) => {
    // Find user
    done(null, User);
    console.log(profile);
    //User.findOne({ google_id: profile.id }, done);
  }
));

module.exports = passport;
