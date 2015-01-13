var appConfig = require('../config/app');
var AWS = require('aws-sdk');

AWS.config.accessKeyId = appConfig.detail.accessKeyId;
AWS.config.secretAccessKey = appConfig.detail.secretAccessKey;
AWS.config.region = appConfig.detail.region;

var s3Bucket = new AWS.S3({
    params: {
        Bucket: appConfig.detail.Bucket
    }
});

module.exports.orderJsonUpload = function (json, callback) {
    var data = {
        Key: appConfig.detail.orderJsonKey,
        Body: JSON.stringify(json),
        ACL: "public-read"
    };

    s3Bucket.putObject(data, callback);
};

module.exports.getOrderJson = function (callback) {
    s3Bucket.getObject({
        Key: appConfig.detail.orderJsonKey
    }, callback);
};
