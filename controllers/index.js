var express = require('express')
, morgan = require('morgan')
, cookieParser = require('cookie-parser')
, bodyParser = require('body-parser')
, expressLayouts = require('express-ejs-layouts')
, methodOverride = require('method-override')
, session = require('express-session');


var app = express();

// configure Express
app.set('views','./views');
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

module.exports.set = function(passport) {
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  // app.get('/', function(req, res){
  //   res.render('index', { user: req.user });
  // });

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
}

module.exports.sendHistoryData= function(result) {
  app.get('/history', function(req, res){
    res.format({
        'application/json': function(){
          res.send(result);
        }
    });
  });
}
