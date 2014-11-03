'use strict';

var Config = require('../eventbriteImages-config.json');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function (passport) {

    passport.use(new GoogleStrategy({
          clientID: Config.google.web.client_id,
          clientSecret: Config.google.web.client_secret,
          scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          callbackURL: Config.google.web.redirect_uris[0],
          passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
          var user = profile._json;

          if (user.hd === Config.googleOauthDomain) {
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
      if (user.hd === Config.googleOauthDomain) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
};
