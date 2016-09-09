var passport = require('passport')
  , util = require('util')
  , DeezerStrategy = require('passport-deezer').Strategy
  , http = require('http')
  , mongoose = require('mongoose')
  , config = require('./config')
  , promise = require('promise')
  , deezer = require('./lib/deezer')
  , controllers = require('./controllers');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Deezer profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the DeezerStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Deezer
//   profile), and invoke a callback with a user object.
passport.use(new DeezerStrategy({
    clientID: config.deezer.cliendID,
    clientSecret: config.deezer.cliendSecret,
    callbackURL: "http://localhost:3000/auth/deezer/callback",
    scope: ['basic_access', 'email', 'listening_history'],

  },
  function(accessToken, refreshToken, profile, done) {
    deezer.getInfosUser(accessToken);
    return done(null, profile);
  }
));

controllers.set(passport);
