var passport = require('passport')
  , util = require('util')
  , DeezerStrategy = require('passport-deezer').Strategy
  , http = require('http')
  , mongoose = require('mongoose')
  , config = require('./config')
  , request = require('request')
  , promise = require('promise')
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
    // asynchronous verification, for effect...
      var urlToGetInfoUser = 'http://'+ config.deezer.host + config.deezer.pathInfoUser + accessToken;
      var urlToGetHistoryUser = 'http://'+ config.deezer.host + config.deezer.pathHistoryUser + accessToken;

      var db = mongoose.connect("mongodb://localhost/concertupdate");

      mongoose.connection.on("error", function (){
        console.log("error to connection ");
      });

      mongoose.connection.on("open", function () {

        var userSchema = mongoose.Schema({
          firstName : String,
          lastName: String,
          email: String,
          picture: String,
          history: Array,
        });

        var DeezerUser = mongoose.model("DeezerUser", userSchema);

        var du = new DeezerUser();

        request(urlToGetInfoUser, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            du.firstName = JSON.parse(body).firstname;
            du.lastName = JSON.parse(body).lastname;
            du.email = JSON.parse(body);
            du.picture = JSON.parse(body).picture_big;

            du.save();
          }
        });

        request(urlToGetHistoryUser, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            du.history = JSON.parse(body).data;
            du.save();
          }
        });


        DeezerUser.find(function (err, deezerusers) {
          if (err) return console.error(err);
          console.log('deezerusers', deezerusers);
        });

      });
      return done(null, profile);
  }
));

controllers.set(passport);
