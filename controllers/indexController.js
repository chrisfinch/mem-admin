'use strict';

var _ = require('lodash-node');
var all = require("node-promise").all;
var Q = require('q');
var request = require('request');
var amazonS3 = require('../service/amazonS3');
var eventbriteUrl = require('../config/app').eventbriteUrl();

function getOwnedEvents (status) {
    var deferred = Q.defer();

    request({
        url: eventbriteUrl + '&status=' + status,
        json: true
    }, function (error, response, body) {

        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(body.events);
        }
    });

    return deferred.promise;
};

function getEventOrder(events, callback) {

    var eventGroups = {
        live: [],
        draft: [],
        canceled: []
    };

    amazonS3.getOrderJson(function (err, data) {
        var priorityEvents = [];
        var ordering;

        if (data && data.Body) {
            ordering = JSON.parse(data.Body.toString('utf-8')).order;
        }

        if (ordering) {
            var priorityEvents = events.filter(function (event) {
                if (ordering.indexOf(event.id) != -1) {
                    return true
                }
                return false
            });

            priorityEvents.sort(function (a, b) {
                var aIndex = ordering.indexOf(a.id);
                var bIndex = ordering.indexOf(b.id);

                if (aIndex > bIndex) {
                    return 1;
                } else if (aIndex < bIndex) {
                    return -1;
                } else {
                    return 0;
                }
            });

            events = events.filter(function (event) {
                //filter out completed and ids not in ordering array
                if ((ordering.indexOf(event.id) != -1) || event.status === 'completed') {
                    return false
                }
                return true
            });

            events.map(function (event) {
                if (eventGroups[event.status]) {
                    eventGroups[event.status].push(event);
                }
            });
        }

        callback(eventGroups, priorityEvents);
    });
};

module.exports.indexAction = function (req, res) {

    if (req.isAuthenticated()) {

        all([
            getOwnedEvents('live'),
            getOwnedEvents('draft'),
            getOwnedEvents('canceled')
        ]).then(function (results) {
            var events = _.flatten(results, true);

            getEventOrder(events, function (eventGroups, priorityEvents) {
                res.render('index', {
                    title: 'Membership Admin',
                    eventGroups: eventGroups,
                    priorityEvents: priorityEvents,
                    error: null
                });
            });

        }, function (error) {
            res.render('index', {
                title: 'Membership Admin - Rate Limited.',
                events: [],
                priorityEvents: [],
                error: error
            });
        });

    } else {
        res.redirect('/login');
    }
};
