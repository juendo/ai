
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
            placeholder: 'E.g. Delargsson, binman',
            required: true,
            type: 'text'
          }
        },
        fieldOrder: [ 'username', 'email', 'password' ]
      }
    }
  }
}));

/**
 * Routes
 */

app.get('/', stormpath.getUser, function(req, res) {
  res.render('views/main', {
    games: [
      {
        link: 'no-thanks',
        name: 'No Thanks',
        description: 'No Thanks! is a card game designed to be as simple as it is engaging. The rules are simple. Each turn, players have two options: play one of their chips to avoid picking up the current face-up card, or pick up the face-up card (along with any chips that have already been played on that card) and turn over the next card. However, the choices aren\'t so easy as players compete to have the lowest score at the end of the game.',
        color: '#ca0'
      },
      {
        link: 'glory-to-rome',
        name: 'Glory to Rome',
        description: 'In 64 A.D., a great fire originating from the slums of Rome quickly spreads to destroy much of the city, including the imperial palace. Upon hearing news of the fire, Emperor Nero Caesar races back to Rome from his private estate in Antium and sets up shelters for the displaced population. Reporting directly to Nero, you are responsible for rebuilding the structures lost in the fire and restoring Glory to Rome.',
        color: '#222'
      }
    ],
    user: req.user
  });
});

// serve index and view partials
app.get('/:game', stormpath.loginRequired, function(req, res) {

    // render template and store the result in html variable
    res.render('public/games/' + req.params.game + '/view', {
        color: {
          'glory-to-rome': '#222',
          'no-thanks': '#ca0'
        }[req.params.game],
        active: {
          'glory-to-rome': '#CCC',
          'no-thanks': '#DDA'
        }[req.params.game],
        inactive: {
          'glory-to-rome': '#333',
          'no-thanks': '#550'
        }[req.params.game]
      },
      function(err, html) {
        res.render('views/index', {
            game: req.params.game,
            color: {
              'glory-to-rome': '#222',
              'no-thanks': '#ca0'
            }[req.params.game],
            active: {
              'glory-to-rome': '#CCC',
              'no-thanks': '#DDA'
            }[req.params.game],
            inactive: {
              'glory-to-rome': '#333',
              'no-thanks': '#550'
            }[req.params.game],
            view: html,
            username: req.user.username
        });

    });
});

var socket = require('./server/socket');
['no-thanks', 'glory-to-rome'].forEach(function(name) {
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

