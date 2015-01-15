'use strict';

var config = require('../config/app');
var appConfig = config.details;
var googleStrategyOptions = config.getGoogleStrategyOptions();
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function (passport) {

    passport.use(new GoogleStrategy(googleStrategyOptions,
        function (req, accessToken, refreshToken, profile, done) {
          var user = profile._json;

          if (user.hd === appConfig.googleOauthDomain) {
            return done(null, user);
          } else {
            return done(null, false, {message: "You don't appear to be a guardian.co.uk user - this application is only for internal use by Guardian staff."});
          }
        }
    ));

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      if (user.hd === appConfig.googleOauthDomain) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
};
