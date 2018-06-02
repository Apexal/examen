const config = require('config');
const passport = require('koa-passport');

const User = require('../db').User;

// This regex matches emails in the student format
// username + 2 digit graduation year + '@regis.org'
const studentEmailRegex = /^[a-zA-Z]+\d{2}@regis.org$/g;

/* Saves the user id to the session */
passport.serializeUser((user, done) => {
  done(null, user._id)
});

/* Gets the user from the saved id serialized above */
passport.deserializeUser((id, done) => {
  User.findById(id, done);
});

const GoogleStrategy = require('passport-google-auth').Strategy;
passport.use(new GoogleStrategy(config.get('auth.google'),
  async (token, tokenSecret, profile, done) => {
    // Ensure only Regis google accounts can be used
    if (profile.domain !== 'regis.org') return done(new Error('Must use a Regis email.'));

    // First email
    const email = profile.emails[0].value;

    // Find user
    let user;

    try {
      user = await User.findOne({
        _google_id: profile.id
      });
    } catch (e) {
      return done(e);
    }

    if (!user) {
      // New user
      user = new User({
        _google_id: profile.id, // Users have an _id and a separate _google_id
        name: {
          first: profile.name.givenName,
          last: profile.name.familyName
        },
        isStudent: studentEmailRegex.test(this.email),
        email,
        dateJoined: new Date()
      });

      try {
        await user.save();
      } catch (e) {
        return done(e);
      }
      console.log('Created new user.');
    }

    console.log('Found user.');
    done(null, user);
  }
));

module.exports = passport;