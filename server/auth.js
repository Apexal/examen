const config = require('config');
const passport = require('koa-passport');

const {
  School,
  User
} = require('../db');

// This regex matches emails in the student format
// username + 2 digit graduation year + '@regis.org'
const studentEmailRegex = /^[a-zA-Z]+\d{2}@regis.org$/;

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
      // Determine school by domain
      let school;

      try {
        school = await School.findOne({
          domain: profile.domain
        });

        if (!school) throw new Error(`Failed to find school with domain "${profile.domain}"`);
      } catch (e) {
        return done(e);
      }

      // New user
      user = new User({
        _google_id: profile.id, // Users have an _id and a separate _google_id
        _school: school,
        name: {
          first: profile.name.givenName,
          last: profile.name.familyName
        },
        isStudent: studentEmailRegex.test(email),
        email,
        dateJoined: new Date()
      });

      try {
        await user.save();
      } catch (e) {
        return done(e);
      }
      console.log('Created new user.');
    } else if (user.accountLocked) {
      return done(new Error('Account locked.'));
    }

    console.log('Found user.');
    done(null, user);
  }
));

module.exports = passport;