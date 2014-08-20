var Config = require(__base + '/eventbriteImages-config.json');

var AWS = require('aws-sdk');

AWS.config.accessKeyId = Config.accessKeyId;
AWS.config.secretAccessKey = Config.secretAccessKey;
AWS.config.region = Config.region;

var s3Bucket = new AWS.S3({params: {Bucket: Config.Bucket}});
var s3MultiPartUploader = require('s3-upload-stream').Uploader;

var s3 = {};

s3.imageUpload = function (fileStream, path, filename, callback) {
  var s3 = new s3MultiPartUploader(
    {
      "accessKeyId": Config.accessKeyId,
      "secretAccessKey": Config.secretAccessKey,
      "region": Config.region
    },
    {
      "Bucket": Config.Bucket,
      "Key": path + "/" + filename,
      "ACL": "public-read",
    },
    function (err, uploadStream)
    {
      if(err)
        console.log(err, uploadStream);
      else
      {
        uploadStream.on('uploaded', callback);

        fileStream.pipe(uploadStream);
      }
    }
  );
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
