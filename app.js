"use strict";

let passport = require('passport'),
  http = require('http'),
  DeezerStrategy = require('passport-deezer').Strategy,
  config = require('./config'),
  express = require('express'),
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  expressLayouts = require('express-ejs-layouts'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  deezer = require('./lib/deezer'),
  songKick = require('./lib/songKick');

let User = {};
let token;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Deezer profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  User = user;
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
    callbackURL: "http://localhost:3000/api/auth/deezer/callback",
    scope: ['basic_access', 'email', 'listening_history'],
  },
  function(accessToken, refreshToken, profile, done) {
    token = accessToken;
    return done(null, profile);
  }
));

let app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(expressLayouts)
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//
//   res.redirect('/login')
// }
//
// app.get('/', function(req, res){
//   res.setHeader('Content-Type', 'application/json');
//   res.send(JSON.stringify({ user: req.user }));
// });

// app.get('/account', ensureAuthenticated, function(req, res){
//   res.render('account', { user: req.user });
// });
//
// app.get('/login', function(req, res){
//   res.render('login', { user: req.user });
// });

// GET /auth/deezer
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Deezer authentication will involve redirecting
//   the user to deezer.com.  After authorization, Deezer will redirect the user
//   back to this application at /auth/deezer/callback

let api = express();

api.get('/auth/deezer',
  passport.authenticate('deezer'),
  function(req, res){
    // The request will be redirected to Deezer for authentication, so this
    // function will not be called.
  }
);

// GET /auth/deezer/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
api.get('/auth/deezer/callback',
  passport.authenticate('deezer', { failureRedirect: '/login' }),
  function(req, res) {
    User.displayName = req.user.displayName;
    User.firstName = req.user.name.givenName;
    User.lastName = req.user.name.familyName;
    User.email = req.user.emails[0].value;
    User.picture = req.user.photos[1].value;
    res.redirect('http://localhost:8000');
  }
);

api.get('/user', function(req, res) {
    if (token) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ member: User }))
    } else {
      res.send(401);
    }
  }
);

function _sortSongs(songs) {
  let listSongSorted=[];
  let _listSongDecorator = function(song) {

    let result = {};
        result.song = {};
        result.artist = {};
        result.album = {};

    result.song["title"] = song.title;
    result.song["link"] = song.link;
    result.song["duration"] = song.duration;
    result.song["preview"] = song.preview;
    result.song["timestamp"] = song.timestamp;
    result.song["title"] = song.title;
    result.song["title"] = song.title;

    result.artist ["name"] = song.artist.name;
    result.artist ["link"] = song.artist.link;

    result.album ["title"] = song.album.title;
    result.album ["link"] = song.album.link;
    result.album ["cover"] = song.album.cover;

    listSongSorted.push(result);
  };
  songs.map(_listSongDecorator);
  return listSongSorted;
}

api.get('/history',
  function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (token) {
      deezer.getHistorySongs(token).then(
        function(response){
          res.send(_sortSongs(JSON.parse(response).data));
        }).catch(
          function(error){
            console.error(error);
        });
    } else {
      res.send(401);
    }
  },
  function(error) {
    console.log('Impossible to get history : ' + error);
  }
);
// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });

app.use('/api',api);

const server = app.listen(3000);
