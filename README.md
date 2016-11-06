# Triage Bot Example

## What is a Triage Bot?
After triggering this bot through a slash command, it will scan the last 1000 messages in the current channel and look for messages that contain certain emojis [[configurable](settings.json#L10)] in the message (not reactions). These messages will be grouped into statuses and reported to the user.

## Status
* [Pending](settings.json#L10) - Messages pending review
* [Review](settings.json#L17) - Messages that are in review
* [Addressed](settings.json#L20) - Messages that have been addressed

## Private Response
![triage-private](https://cloud.githubusercontent.com/assets/35968/20042579/5dfe2390-a431-11e6-8ff6-ed8158329328.png)

## Public Response
![triage-public](https://cloud.githubusercontent.com/assets/35968/20042580/5e01c3ba-a431-11e6-8db3-6e0f7021d979.png)

## Settings
You can adjust the messages, emoji, and reactjis by updates the [settings.json](settings.json) file or passing in any overrides you'd like to the main function.

```js
let triage = require('triage');

triage(payload, messages, {
  display: [ "pending", "looked_at" ]
});
```
