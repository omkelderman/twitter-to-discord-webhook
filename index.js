const Twitter = require('node-tweet-stream');
const request = require('request');

const CONFIG = require('./config.json');

const t = new Twitter(CONFIG.twitter);

t.on('tweet', tweet => {
    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
    console.log(`[${tweet.id_str}] tweet ${tweetUrl} received`);
    const discordWebhooks = CONFIG.hooksPerTwitterAccount[tweet.user.id_str];
    if (!discordWebhooks) {
        console.log(`[${tweet.id_str}] this twitter account has no webhooks configured, do nothing`)
        return;
    }

    const discordWebhookObject = {
        content: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
        username: tweet.user.name,
        avatar_url: tweet.user.profile_image_url_https
    }

    console.log(`[${tweet.id_str}] this twitter account has ${discordWebhooks.length} webhook(s) configured, executing:`);
    for (const discordWebhook of discordWebhooks) {
        console.log(`[${tweet.id_str}] shoot webhook ${discordWebhook.id}`);
        request.post({
            url: `https://discord.com/api/webhooks/${discordWebhook.id}/${discordWebhook.token}`,
            json: discordWebhookObject
        });
    }
});

t.on('error', err => {
    console.error('error', err);
});

t.follow(Object.keys(CONFIG.hooksPerTwitterAccount));
