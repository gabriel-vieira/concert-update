function getInfosUser (accessToken, refreshToken, profile, done) {

  var urlToGetHistoryUser = 'http://'+ config.deezer.host + config.deezer.pathHistoryUser + accessToken;

  listSongs = getHistory(urlToGetHistoryUser);

  return done(null, profile);  
}

function sortHistory (dataFromDeezer) {

  var listSorted = [];
  for (song in dataFromDeezer) {

    var artistName = dataFromDeezer[song].artist.name;
    if (listSorted.indexOf(artistName)  == -1) {
        listSorted.push(artistName);
    };
  }
  return listSorted;
}

function getHistory (urlAPI) {

  request(urlAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var listArtistSorted = sortHistory(JSON.parse(body).data);
      controllers.sendHistoryDataInFormatJSON(listArtistSorted); 
    }
  });
}

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
    getInfosUser(accessToken, refreshToken, profile, done);
  }
));

controllers.set(passport);