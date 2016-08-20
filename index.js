var CronJob = require('cron').CronJob;
var Twitter = require('twitter');

new CronJob('*/5 * * * *', function() {
    runLogic();
}, null, true, 'America/Los_Angeles');


var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function runLogic(userId) {
    var params = { count: 5000 };
    if(typeof userId == 'undefined') {
        params.screen_name = 'BarackObama';
    }
    client.get('friends/ids', params, handleGetFollowTargetFriendIds);
}

function handleGetFollowTargetFriendIds(error, result, response) {
    if(!error) {
        var rand_id = result.ids[Math.floor(Math.random() * result.ids.length)];
        var params = { count: 5000, user_id: rand_id };
        client.get('friends/ids', params, handleGetFriendIds);
    } // not trying again on error, due to api-limits
}

function handleGetFriendIds(error, result, response) {
    if (!error) {
        var rand_id = result.ids[Math.floor(Math.random() * result.ids.length)];
        console.log('Will start following the lucky guy/girl with ID ' + rand_id + ' if the user has some tweets.');

        var params_timeline = { user_id: rand_id };
        client.get('statuses/user_timeline', params_timeline, handleGetUserTimeline);
    } // not trying again on error, due to api-limits
}

function handleGetUserTimeline(error, result, response) {
    if(!error) {
        if (result.length > 0) {
            var params = { user_id: result[0].user.id, follow: false};
            client.post('friendships/create', params, handlePostFollowUserId);

            var rand_lat = (Math.random() * (180.000000 - 0.000000) + 0.000000);
            rand_lat = (rand_lat - 90.000000).toFixed(6);
            var rand_lon = (Math.random() * (360.000000 - 0.000000) + 0.000000);
            rand_lon = (rand_lon - 180.000000).toFixed(6);

            console.log('Pretending to be in lat: ' + rand_lat + ', long: ' + rand_lon);
            var message = "I'm starting to follow @" + result[0].user.screen_name + " now.";

            var params_tweet = { status: message, lat: rand_lat, long: rand_lon };
            client.post('statuses/update', params_tweet, handleAnnounceFollower);

            var params_retweet = { id: result[0].id };
            client.post('statuses/retweet/' + result[0].id, params_retweet, handleRetweet);
        } // not trying again on error, due to api-limits
    }
}

function handleRetweet(error, result, response) {
    if(!error) {
        console.log("retweeted last tweet");
    } else {
        console.log(error);
    }
}

function handleAnnounceFollower(error, result, response) {
    if(!error) {
        console.log("I tweeted!");
    } // tweet failed, not trying again, due to api-limits
}

function handlePostFollowUserId(error, result, response) {
    if(!error) {
        console.log('Follow successful');
    } // not trying again on error, due to api-limits
}
