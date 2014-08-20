var express = require('express');
var router = express.Router();

var Config = require(__base + '/config.json');

var all = require("node-promise").all;
var fs = require('fs');
var request = require('request');
var easyimg = require('easyimage');
var passport = require('passport');

var s3 = require(__base + 'modules/s3');

var ebUrl = function () {
  var s = [];
  s.push(Config.eventbriteApiUrl);
  s.push(Config.eventbriteApiEventListUrl);
  s.push("?token=");
  s.push(Config.eventbriteApiToken);

  return s.join("");
}

//var url = "http://ec2-54-76-188-66.eu-west-1.compute.amazonaws.com";

router.get('/healthcheck', function (req, res) {
  res.send(200);
});

router.get('/login', function (req, res) {
  res.render('login', { error: req.flash('error')});
});

router.get('/login/google', passport.authenticate('google'));

router.get('/login/return', passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
  }));


/* GET home page. */
router.get('/', function(req, res) {

    if (req.isAuthenticated()) {

    request({
      url: ebUrl(),
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode == 200) {
        var events = body.events;

        s3.getOrderJson(function (err, data) {
          if (data && data.Body) { var ordering = JSON.parse(data.Body.toString('utf-8')).order; }
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
            priorityEvents: priorityEvents,
            error: null
          });

        });

      } else {

        var error;

        if (body) {
          error = body.status_code == 429 ? "Hit eventbrite rate limit - please try again in a while." : body.error_description;
        } else {
          error = error.toString();
        }

        res.render('index', {
          title: 'Membership Admin - Rate Limited.',
          events: [],
          priorityEvents: [],
          error: error
        });
      }

    });
  } else {
    res.redirect("/login");
  }

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
              dst:__dirname + '/../public/uploads/64'+'.png',
              width: 64
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/300'+'.png',
              width: 300,
              height: 180
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/300-2x' + '.png',
              width: 600,
              height: 360
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/460' + '.png',
              width: 460,
              height: 276
            }),
            easyimg.resize({
              src: path,
              dst:__dirname + '/../public/uploads/460-2x' + '.png',
              width: 920,
              height: 552
            })
          ]).then(function (results) {

            fs.unlink(path);

            results.forEach(function (result) {
              var n = result.name.split(" ");
              n = n.length > 1 ? n[1] : n[0]; // workaround for https://github.com/hacksparrow/node-easyimage/issues/32
              var filePath = __dirname + '/../public/uploads/' + n;
              var stream = fs.createReadStream(filePath);
              s3.imageUpload(stream, fieldname, n, function () {
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
