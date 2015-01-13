'use strict';

var indexController = require('./controllers/indexController');
var loginController = require('./controllers/loginController');
var orderController = require('./controllers/orderController');
var healthCheckController = require('./controllers/healthCheckController');

module.exports = function (express, app) {

    var router = express.Router();

    router.get('/', indexController.indexAction);

    router.post('/order', orderController.indexAction);

    router.get('/login', loginController.indexAction);

    router.get('/login/google', loginController.googleAction);

    router.get('/login/return', loginController.returnAction);

    router.get('/healthcheck', healthCheckController.indexAction);

    app.use(router);
};
