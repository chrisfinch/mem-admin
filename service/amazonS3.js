var appConfig = require('../config/app').details;
var AWS = require('aws-sdk');

AWS.config.accessKeyId = appConfig.accessKeyId;
AWS.config.secretAccessKey = appConfig.secretAccessKey;
AWS.config.region = appConfig.region;

var s3Bucket = new AWS.S3({
    params: {
        Bucket: appConfig.Bucket
    }
});

module.exports.orderJsonUpload = function (json, callback) {
    var data = {
        Key: appConfig.orderJsonKey,
        Body: JSON.stringify(json),
        ACL: "public-read"
    };

    s3Bucket.putObject(data, callback);
};

module.exports.getOrderJson = function (callback) {
    s3Bucket.getObject({
        Key: appConfig.orderJsonKey
    }, callback);
};
