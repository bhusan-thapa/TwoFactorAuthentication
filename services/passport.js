const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const User = require('../models/user');
// const config = require('../config');
const keys = require('../config/key');
const localOption = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOption, function(
  email,
  password,
  done
) {
  User.findOne({ email }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }
    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false);
      }
      done(null, user);
    });
  });
});
const jwtOptions = {
  jwtFromRequest: extractJwt.fromHeader('authorization'),
  secretOrKey: keys.secret
};
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // var expirationDate = new Date(payload.exp * 1000);

  // if (expirationDate < new Date()) {
  //   return done(null, false);
  // }
  // else {
  User.findById(payload.sub, function(err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
  // }
});
passport.use(jwtLogin);
passport.use(localLogin);
