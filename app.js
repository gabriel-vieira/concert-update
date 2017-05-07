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

var User = {};

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
  User = user;
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

var api = express();

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
    console.log('User', User)
    res.redirect('http://localhost:8000');
  }
);

api.get('/user', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ member: User }))
  }
);

api.get('/history',
  function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send([
      {
        'name': 'Mick Jagger',
        'pictureUrl': 'http://e-cdn-images.deezer.com/images/artist/7b9e49277652ca2c4939d36470bd42a4/220x220-000000-80-0-0.jpg',
        'songs': ['Sweet Thing','Out Of Focus','Use me']
      },
      {
        'name': 'David Bowie',
        'pictureUrl': 'http://e-cdn-images.deezer.com/images/artist/2ed9ffd66d730e7888a6d5e553af6fd3/220x220-000000-80-0-0.jpg',
        'songs': ['Under pressure','Life on mars','Let\'s dance']
      },
    ]);
  }
);

// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });

app.use('/api',api);

var server = app.listen(3000);
