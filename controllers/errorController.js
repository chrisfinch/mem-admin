'use strict';

var ERROR_DESCRIPTION_404 = 'Sorry the page you were looking for is not available.';
var ERROR_DESCRIPTION_500 = 'Internal server error';
var NOT_FOUND_ERROR_CODE = 404;
var INTERNAL_SERVER_ERROR_CODE = 500;

module.exports.notFoundAction = function (req, res, next) {
    res.send(NOT_FOUND_ERROR_CODE, ERROR_DESCRIPTION_404);
    next();
};

module.exports.internalServerError = function (req, res) {
    res.send(INTERNAL_SERVER_ERROR_CODE, ERROR_DESCRIPTION_500);
};
