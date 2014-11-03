var Config = require('../eventbriteImages-config.json');

var AWS = require('aws-sdk');

AWS.config.accessKeyId = Config.accessKeyId;
AWS.config.secretAccessKey = Config.secretAccessKey;
AWS.config.region = Config.region;

var s3Bucket = new AWS.S3({params: {Bucket: Config.Bucket}});

var s3 = {};

s3.imageUpload = function (fileStream, path, filename, callback) {
  var data = {
    'Bucket': Config.Bucket,
    'Key': path + '/' + filename,
    'ACL': 'public-read',
    'ContentType': 'image/jpeg',
    'Body': fileStream
  };
  s3Bucket.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      callback();
    }
  });
};

s3.orderJsonUpload = function (json, callback) {
  var data = {
    Key: Config.orderJsonKey,
    Body: JSON.stringify(json),
    ACL: "public-read"
  };
  s3Bucket.putObject(data, callback);
};

s3.getOrderJson = function (callback) {
  s3Bucket.getObject({
    Key: Config.orderJsonKey
  }, callback);
};

module.exports = s3;
