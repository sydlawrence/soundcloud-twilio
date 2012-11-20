var config = {
    port: process.env.VMC_APP_PORT || 1337,

    title: "Soundcloud Phone Call",

    twilio: {
        account_sid: "xxx",
        auth_token: "xxx",
        number: "xxx"
    },

    soundcloud: {
      id: "xxx"
    }
};



var express = require('express'),
    request = require('request'),
    util = require('util'),
    Twilio = require('twilio-js');

/*
 * Setup the twilio auth details
 */

Twilio.AccountSid = config.twilio.account_sid;
Twilio.AuthToken = config.twilio.auth_token;



/**
 * End of Twilio setup
 */





/**
 * Express setup bits
 *
 * 
 */

var app = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('short'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

/**
 * End of Express setup bits
 */




/**
 * Get the soundcloud id from the soudncloud url
 * I have already built a simple web service for this.
 * 
 */

function getSoundcloudIDFromURL(url, callback) {
    var url = "https://api.soundcloud.com/resolve.json?client_id="+config.soundcloud.id+"&url="+url;
    request({url:url, json:true}, function (error, response, data) {
      if (!error && response.statusCode == 200) {
        callback(data.id);
      }
    })
}




/**
 * Render the page
 * 
 */

app.get("/", function (req, res) {
    var socketID = Math.random()*1000000000 + (new Date()).getTime();

    // if form has been submited
    if (req.query.url !== undefined) {
        var url = req.query.url;

        // get the id from the url
        getSoundcloudIDFromURL(url, function(id) {

            // create the phone call
            // I have built a simple web service for this.
            var url = "http://wemakeawesomesh.it/soundcloudID/twiml.php?id="+id+"&socket_id="+socketID;
            Twilio.Call.create({
                to: req.query.to,
                from: config.twilio.number,
                url: url
            }, function(e) {
                res.render('index', { title: config.title, phonecall: true, socketID:socketID})
            });
        })
    } else {
        res.render('index', { title: config.title, phonecall: false})
    }
})


app.listen(config.port, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});