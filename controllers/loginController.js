'use strict';

var passport = require('passport');

module.exports.indexAction = function (req, res) {
    res.render('login', {
        title: 'Login',
        error: req.flash('error')
    });
};

module.exports.googleAction = passport.authenticate('google');

module.exports.returnAction = passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
});
