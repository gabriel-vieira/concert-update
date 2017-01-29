var passport = require('passport'),
  http = require('http'),
  DeezerStrategy = require('passport-deezer').Strategy,
  config = require('./config'),
  express = require('express')
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  expressLayouts = require('express-ejs-layouts'),
  methodOverride = require('method-override'),
  session = require('express-session');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Deezer profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  console.log('serializeUser user',user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log('deserializeUser user',obj);
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
    console.log('profile', profile);
    return done(null, profile);
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
app.use(session({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}

app.get('/', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ user: req.user }));
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
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ user: req.user }));
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var server = app.listen(3000);
