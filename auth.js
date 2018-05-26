const config = require('config');
const passport = require('koa-passport');

const User = require('./db').User;

passport.serializeUser((user, done) => {
  done(null, user._id)
});

passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy(config.get('auth.google'),
  (token, tokenSecret, profile, done) => {
    if (profile.domain !== 'regis.org') return done(new Error('Must use a Regis email.'));

    // First email
    const email = profile.emails[0].value;

    // Find user
    User.findOne({
        _google_id: profile.id
      })
      .then(user => {
        if (!user) {
          // New user
          user = new User({
            _google_id: profile.id,
            isStudent: true /* TODO: check based on email */ ,
            name: {
              first: profile.name.givenName,
              last: profile.name.familyName
            },
            email,
            dateJoined: new Date()
          });

          user.save();
          console.log('Created new student.');
        }

        console.log('Found student.');
        done(null, user);
      })
      .catch(done);
  }
));

module.exports = passport;