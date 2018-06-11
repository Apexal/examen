const passport = require('koa-passport');

const {
  School,
  User
} = require('../db').models;

// This regex matches emails in the student format
// username + 2 digit graduation year + '@regis.org'
const studentEmailRegex = /^[a-zA-Z]+\d{2}@regis.org$/;

/* Saves the user id to the session */
passport.serializeUser((user, done) => {
  done(null, user._id)
});

/* Gets the user from the saved id serialized above */
passport.deserializeUser((id, done) => {
  User.findById(id, done).populate('_school');
});

const GoogleStrategy = require('passport-google-auth').Strategy;
passport.use(new GoogleStrategy({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (token, tokenSecret, profile, done) => {
    // First email
    const email = profile.emails[0].value;

    // Find user
    let user;

    try {
      user = await User.findOne({
        _google_id: profile.id
      }).populate('_school');
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
        admin: false,
        email,
        dateJoined: new Date()
      });

      user.lastLogin = new Date();

      try {
        await user.save();
        require('./email').sendEmail(email, `Welcome to the Examen!`, 'firstLogin', {
          name: user.name,
          school,
          websiteUrl: 'https://ignatian-examen.herokuapp.com/'
        });
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