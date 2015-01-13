'use strict';

var config = require('../eventbriteImages-config.json');

module.exports.eventbriteUrl = function () {
    return [config.eventbriteApiUrl, config.eventbriteApiEventListUrl, '?token=', config.eventbriteApiToken].join('');
};

module.exports.detail = config;
