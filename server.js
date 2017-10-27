var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var http = require('http');
var server = http.createServer(app);
var Twit = require('twit');
var io = require('socket.io').listen(server);
var sentiment = require('sentiment');
var config = require('./config');
server.listen(config.port, function () {
    console.log(config.index.title + ' running on port ' + config.port + '.');
});
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('static'));

app.use(express.bodyParser());

app.get('/', function (req, res) {
    res.render('index', config);
});


var T = new Twit(config.keys);


var stream = T.stream('statuses/filter', {track: config.streamHash, language: 'en'});

stream.on('tweet', function (tweet) {
    if (io.engine.clientsCount) {
        var aSentiment = sentiment(tweet.text);
        if (aSentiment.score <= config.sentimentSensitivity.negative)
            aSentiment.score = -1;
        else if (aSentiment.score >= config.sentimentSensitivity.positive)
            aSentiment.score = 1;
        else
            aSentiment.score = 0;

        io.sockets.emit('stream', {
            text: tweet.text,
            name: tweet.user.name,
            username: tweet.user.screen_name,
            icon: tweet.user.profile_image_url,
            sentiment: aSentiment,
            id: tweet.id
        });
    }
});