'use strict';

var GOOGLE_STRATEGY_SCOPE = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
var config = require('../eventbriteImages-config.json');
var isDev = process.env.NODE_ENV === 'development';

module.exports.details = config;

module.exports.eventbriteUrl = function () {
    return [config.eventbriteApiUrl, config.eventbriteApiEventListUrl, '?token=', config.eventbriteApiToken].join('');
};

module.exports.getGoogleStrategyOptions = function () {
    return {
        clientID: isDev ? config.google.web.dev_client_id : config.google.web.client_id,
        clientSecret: isDev ? config.google.web.dev_client_secret : config.google.web.client_secret,
        scope: GOOGLE_STRATEGY_SCOPE,
        callbackURL: isDev ? config.google.web.dev_redirect_uris[0] : config.google.web.redirect_uris[0],
        passReqToCallback: true
    };
};
