var express = require('express');
var router = express.Router();

var Config = require(__base + '/config.json');

var all = require("node-promise").all;
var fs = require('fs');
var request = require('request');
var easyimg = require('easyimage');

var s3 = require(__base + '/modules/s3');

var ebUrl = function () {
  var s = [];
  s.push(Config.eventbriteApiUrl);
  s.push(Config.eventbriteApiEventListUrl);
  s.push("?token=");
  s.push(Config.eventbriteApiToken);

  return s.join("");
}

/* GET home page. */
router.get('/', function(req, res) {

  request({
    url: ebUrl(),
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var events = body.events;

      s3.getOrderJson(function (err, data) {
        var ordering = JSON.parse(data.Body.toString('utf-8')).order;
        var priorityEvents = [];

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
            if (ordering.indexOf(event.id) != -1) {
              return false
            }
            return true
          });
        }

        res.render('index', {
          title: 'Membership Admin',
          events: events,
          priorityEvents: priorityEvents
        });

      });

    } else {
      console.log(response.body.error);
      //res.send(500);
      res.render('index', {
        title: 'Membership Admin - Rate Limited.',
        events: [],
        priorityEvents: []
      });
    }

  });

});

router.post('/order', function (req, res) {
  s3.orderJsonUpload(req.body, function (err, data) {
    if (!err) {
      console.log("uploaded " + req.body.order + " to s3");
      res.send(200);
    } else {
      console.log(err);
      res.send(500);
    }
  });
});

router.post('/upload', function (req, res) {

    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, contentType) {
      if (file && filename) {

        var path = __dirname + '/../public/uploads/' + filename;

        fstream = fs.createWriteStream(path);

        file.pipe(fstream);300/180

        fstream.on('close', function () {
          all([
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/300x180'+'.png',
              width: 300,
              height: 180
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/300x180-2x' + '.png',
              width: 600,
              height: 360
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/460x276' + '.png',
              width: 460,
              height: 276
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/460x276-2x' + '.png',
              width: 920,
              height: 552
            })
          ]).then(function (results) {

            fs.unlink(path);

            results.forEach(function (result) {
              var filePath = __dirname + '/../public/uploads/' + result.name;
              var stream = fs.createReadStream(filePath);
              s3.imageUpload(stream, fieldname, result.name, function () {
                fs.unlink(filePath);
              });
            });

            res.send(200);
          }, function (err) {
            console.log("err: ", err)
          });

        });

      }
    });

});

module.exports = router;
