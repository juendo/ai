
/**
 * Module dependencies
 */
var express = require('express');
var stormpath = require('express-stormpath');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var http = require('http'),
  path = require('path');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io')({
	'transports': ['xhr-polling'],
	'polling duration': 10
}).listen(server);

/**
 * Configuration
 */

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname);
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true, saveUninitialized: true, 
                  secret: 'uwotm8' }));

// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse multipart/form-data
app.use(multer());

app.use(express.static(path.join(__dirname, 'public')));

app.use(stormpath.init(app, {
  preRegistrationHandler: function (formData, req, res, next) {
    if (formData.username.length > 10) return next(new Error('Username can\'t be longer than 10 characters.'));
    next();
  },
  website: true,
  web: {
    login: {
      enabled: true,
      nextUri: '/',
      view: path.join(__dirname,'views','login.jade')
    },
    logout: {
      enabled: true,
      nextUri: '/'
    },
    me: {
      enabled: false
    },
    oauth2: {
      enabled: false
    },
    register: {
      form: {
        fields: {
          givenName: {
            enabled: false
          },
          surname: {
            enabled: false
          },
          username: {
            enabled: true,
            label: 'Username',
            placeholder: 'Username',
            required: true,
            type: 'text'
          },
          email: {
            placeholder: 'Email'
          },
          password: {
            placeholder: 'Password'
          }
        },
        fieldOrder: [ 'username', 'email', 'password' ],
      },
      view: path.join(__dirname,'views','register.jade')
    }
  }
}));

/**
 * Routes
 */

var games = require('./games.js');

app.get('/', stormpath.getUser, function(req, res) {
  res.render('views/main', {
    games: games,
    user: req.user
  });
});

app.get('/favicon.ico', function(req, res) {
  
});

// serve index and view partials
app.get('/:game', stormpath.loginRequired, function(req, res) {

    // render template and store the result in html variable
    res.render('public/games/' + req.params.game + '/view', {
        color: games[req.params.game].color,
        active: games[req.params.game].active,
        inactive: games[req.params.game].inactive
      },
      function(err, html) {
        console.log(err);
        res.render('views/index', {
            game: req.params.game,
            color: games[req.params.game].color,
            active: games[req.params.game].active,
            inactive: games[req.params.game].inactive,
            view: html,
            username: req.user.username
        });

    });
});

var socket = require('./server/socket');
Object.keys(games).forEach(function(name) {
  var nsp = io.of('/' + name);
  var socketServer = socket(nsp);
  // Socket.io Communication
  nsp.on('connection', socketServer);
});


/**
 * Start Server
 */
/*
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});*/

app.on('stormpath.ready', function() {
  server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
});

