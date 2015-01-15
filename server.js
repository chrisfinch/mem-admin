var COOKIE_PARSER_SECRET = 'scdisecuyawebifucywr78';
var SESSION_SECRET = '345o3t03utv9uchvpieuhv';

var express = require('express');
var app = express();
var routes = require('./routes');
var errorController = require('./controllers/errorController');

var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var passportConf = require('./config/passport');
var flash = require('connect-flash');
var morgan = require('morgan');

passportConf(passport);

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser(COOKIE_PARSER_SECRET));
app.use(session({ secret: SESSION_SECRET, cookie: { maxAge: 3600000 } }));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

routes(express, app);

//404 error
app.use(function (req, res, next) {
    errorController.notFoundAction(req, res, next);
});

//500 error
app.use(function (req, res) {
    errorController.internalServerError(req, res);
});

module.exports = app;
