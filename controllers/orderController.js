'use strict';

var amazonS3 = require('../models/amazonS3');

module.exports.indexAction = function (req, res) {
    amazonS3.orderJsonUpload(req.body, function (err) {
        if (!err) {
            console.log("uploaded " + req.body.order + " to amazon S3");
            res.send(200);
        } else {
            console.log(err);
            res.send(500);
        }
    });
};
