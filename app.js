var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , morgan = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , session = require('express-session')
  , expressLayouts = require('express-ejs-layouts')
  , DeezerStrategy = require('passport-deezer').Strategy
  , http = require('http')
  , mongoose = require('mongoose')
  , config = require('./config')
  , request = require('request');

var result = {};

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
    process.nextTick(function () {
      // To keep the example simple, the user's Deezer profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Deezer account with a user record in your database,
      // and return that user instead.
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
        });

        request(urlToGetInfoUser, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            result.userInfo = JSON.parse(body);

            var DeezerUser = mongoose.model("DeezerUser", userSchema);

            var du = new DeezerUser({ 
              firstName: result.userInfo.firstname,
              lastName: result.userInfo.lastname,
              email: result.userInfo.email, 
              picture: result.userInfo.picture_big,  
            });
            du.save();
            
            DeezerUser.find(function (err, deezerusers) {
              if (err) return console.error(err);
              console.log('deezerusers', deezerusers);
            });
          }
        });

        // request(urlToGetHistoryUser, function (error, response, body) {
        //   if (!error && response.statusCode == 200) {
        //     result.history = JSON.parse(body);

        //     var DeezerUser = mongoose.model("DeezerUser", userSchema);

        //     var du = new DeezerUser({ 
        //       firstName: result.userInfo.firstname,
        //       lastName: result.userInfo.lastname,
        //       email: result.userInfo.email, 
        //       picture: result.userInfo.picture_big,  
        //     });
        //     du.save();
            
        //     DeezerUser.find(function (err, deezerusers) {
        //       if (err) return console.error(err);
        //       console.log('deezerusers', deezerusers);
        //     });
        //   }
        // });

      });
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(expressLayouts)
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({ 
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/deezer
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Deezer authentication will involve redirecting
//   the user to deezer.com.  After authorization, Deezer will redirect the user
//   back to this application at /auth/deezer/callback
app.get('/auth/deezer',
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
app.get('/auth/deezer/callback',
  passport.authenticate('deezer', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var server = app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}
