## What is a Triage Bot?
After triggering this bot through a slash command, it will scan the last 1000 messages in the current channel and look for messages that contain certain emojis [[configurable](settings.json#L10)] in the message (not reactions). These messages will be grouped into statuses and reported to the user.

### Statuses
* [Pending](settings.json#L10) - Messages pending review
* [Review](settings.json#L17) - Messages that are in review
* [Addressed](settings.json#L20) - Messages that have been addressed

## Requirements
* A [Slash Command](https://my.slack.com/services/new/slash-commands) setup on your Slack Team
* A [Slack Bot Token](https://my.slack.com/services/new/bot) or a token with at least the `channels:history` scope

## Usage

### Environment Variables
* `TOKEN` - The Slack token
* `PORT` - The webserver port

### Starting
```shell
TOKEN=xoxp-XXXXXXXXXX PORT=3000 npm start
```

### Contents
* [server.js](server.js) - A very basic webserver and http client to post back to Slack
* [index.js](index.js) - The main functionality lies here. Pass in the Slash command payload, the channel history, and optionally any settings overrides. You'll get a formatted Slack message with the results.

### API
```js
let triage = require('./index');

let message = triage(
  payload,    // The payload from the Slack slash command
  messages,   // An array of slack messages to triage
  settings    // Any settings overrides to apply [optional]
);
```

### Settings
You can adjust the messages, emoji, and reactjis by updates the [settings.json](settings.json) file or passing in any overrides you'd like to the main function.

```js
let triage = require('./index');

triage(payload, messages, {
  display: [ "pending", "review" ]
});
```


## Private Response
![triage-private](https://cloud.githubusercontent.com/assets/35968/20042579/5dfe2390-a431-11e6-8ff6-ed8158329328.png)

## Public Response
![triage-public](https://cloud.githubusercontent.com/assets/35968/20042580/5e01c3ba-a431-11e6-8db3-6e0f7021d979.png)


## Existing Apps
Already have an app and just want the Triage builder? No problem, you could require this package or copy the contents from [index.js](index.js).
