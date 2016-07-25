
/**
 * Module dependencies
 */
var express = require('express');
//var stormpath = require('express-stormpath');
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

/*app.use(stormpath.init(app, {
  website: true,
  web: {
    login: {
      enabled: true
    },
    logout: {
      enabled: true
    },
    me: {
      enabled: false
    },
    oauth2: {
      enabled: false
    },
    register: {
      enabled: true
    }
  }
}));
*/

/**
 * Routes
 */

app.get('/', function(req, res) {
  res.render('views/main', {
    games: [
      {
        link: 'no-thanks',
        name: 'No Thanks',
        color: '#ca0'
      },
      {
        link: 'glory-to-rome',
        name: 'Glory to Rome',
        color: '#222'
      }
    ]
  });
});

// serve index and view partials
app.get('/:game', /*stormpath.loginRequired, */function(req, res) {

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
        }[req.params.game],
        component: {
          class: 'person',
          repeat: 'card in player.cards'
        }
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
            view: html
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

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
/*
app.on('stormpath.ready', function() {
  server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
});*/

